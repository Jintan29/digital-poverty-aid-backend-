const { where } = require("sequelize");
const db = require("../models");
const financialcapital_model = db.Financialcapital;
const form_model = db.Form;
const saving_model = db.Saving;
const household_model = db.Household;
const householdexpenses_model = db.Householdexpenses;
const nonAgiIncome_model = db.NonAGIincome;
const AGI_financial_model = db.AGIFinancial; //เก็บข้อมูลรายได้จากการเกษตร
const debt_model = db.Debt;
const creditsources_model = db.Creditsources;
const memberHousehold_model = db.MemberHousehold;
const physicalCapital_model = db.PhysicalCapital;
const help_member_model = db.HelpMember;

exports.getFinalcapital = () => {
  try {
    return financialcapital_model.findAll({ include: form_model });
  } catch (err) {
    return err;
  }
};

exports.findOneById = async (id) => {
  return financialcapital_model.findOne({
    where: { id: id },
    include: form_model,
  });
};

exports.create = async (financialcapitalObj) => {
  try {
    return await financialcapital_model.create(financialcapitalObj);
  } catch (err) {
    return err;
  }
};

exports.update = async (financialcapitalObj, id) => {
  return await financialcapital_model
    .update(financialcapitalObj, {
      where: { id: id },
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleted = async (id) => {
  await financialcapital_model
    .destroy({
      where: { id: id },
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.createCombined = async (data) => {
  try {
    // เริ่ม transaction เพื่อให้แน่ใจว่าข้อมูลทุกส่วนถูกบันทึกพร้อมกัน
    const result = await db.sequelize.transaction(async (t) => {
      // สร้างข้อมูลในตาราง financialcapita
      const financialcapital = await financialcapital_model.create(
        {
          formId: data.formId,
        },
        { transaction: t } // ใช้ transaction เพื่อทำให้แน่ใจว่าการบันทึกข้อมูลนี้จะถูกม้วนกลับหากเกิดปัญหา
      );

      // สร้างข้อมูลในตาราง Saving (หลายรายการ)
      const savingPromises = data.Saving.map(async (savingData) => {
        return await saving_model.create(
          {
            is_has_saving: savingData.is_has_saving, // บันทึกว่ามีการออมเงินหรือไม่
            saving_type: savingData.saving_type, // ประเภทการออม
            amount: savingData.amount, // จำนวนเงินออม
            finan_capital_id: financialcapital.id,
          },
          { transaction: t } // ใช้ transaction
        );
      });

      // รอให้คำสั่ง create ทั้งหมดใน Saving สำเร็จ
      const savingArray = await Promise.all(savingPromises);

      // ส่งผลลัพธ์ที่รวมกันของข้อมูลทั้งหมดกลับไป
      return {
        financialcapital,
        savingArray,
      };
    });

    return result; // ส่งผลลัพธ์สุดท้ายกลับไป
  } catch (err) {
    throw new Error(err.message); // ถ้ามีข้อผิดพลาดเกิดขึ้น ให้โยนข้อผิดพลาดนั้น
  }
};

exports.findAllByHouseholdId = async (householdId) => {
  // ค้นหา household ที่มี id ตรงกับ householdId
  const household = await household_model.findOne({
    where: { id: householdId },
    include: [
      {
        model: form_model, // เชื่อมกับ form เพื่อดึงข้อมูล formId
        include: [
          {
            model: financialcapital_model, // เชื่อมกับ Financialcapital
            include: [
              {
                model: householdexpenses_model, // เชื่อมกับ Householdexpenses
              },
            ],
          },
        ],
      },
    ],
  });

  if (!household) {
    throw new Error("Household not found");
  }

  // ตรวจสอบว่ามีข้อมูล Householdexpenses หรือไม่
  const financialCapital = household.Form?.Financialcapital;
  if (financialCapital?.Householdexpenses) {
    // คำนวณผลรวมของ amount_per_month
    const totalExpenses = financialCapital.Householdexpenses.reduce(
      (sum, expense) => sum + expense.amount_per_month,
      0
    );

    // เพิ่ม totalExpenses ใน response
    return {
      ...household.toJSON(), // แปลงข้อมูล household เป็น JSON
      totalExpenses, // ผลรวมของค่าใช้จ่าย
    };
  }

  return household;
};

exports.findIncome = async (householdId) => {
  const household = await household_model.findOne({
    where: { id: householdId },
    include: [
      {
        model: form_model, // เชื่อมกับ form เพื่อดึงข้อมูล formId
        include: [
          {
            model: financialcapital_model, // เชื่อมกับ Financialcapital
            include: [
              {
                model: nonAgiIncome_model,
                order: [['createdAt', 'DESC']], 
              },
              {
                model: AGI_financial_model,
                order: [['createdAt', 'DESC']],
              }
            ],
          },
        ],
      },
    ],
  });

  if (!household) {
    throw new Error("Household not found");
  }

  const financialCapital = household.Form?.Financialcapital;
  if (financialCapital?.NonAGIincomes) {
    // คำนวณผลรวมของ amount_per_year และ cost_per_year
    const totalAmountPerYear = financialCapital.NonAGIincomes.reduce(
      (sum, income) => sum + (income.amount_per_year || 0),
      0
    );
    const totalCostPerYear = financialCapital.NonAGIincomes.reduce(
      (sum, income) => sum + (income.cost_per_year || 0),
      0
    );

    // เพิ่มผลรวมใน response
    return {
      ...household.toJSON(), // แปลงข้อมูล household เป็น JSON
      totalAmountPerYear, // ผลรวมของ amount_per_year
      totalCostPerYear, // ผลรวมของ cost_per_year
    };
  }
  return household;
};

exports.findSaving = async (householdId) => {
  const household = await household_model.findOne({
    where: { id: householdId },
    include: [
      {
        model: form_model, // เชื่อมกับ form เพื่อดึงข้อมูล formId
        include: [
          {
            model: financialcapital_model, // เชื่อมกับ Financialcapital
            include: [
              {
                model: saving_model, // เชื่อมกับ Saving
              },
            ],
          },
        ],
      },
    ],
  });

  if (!household) {
    throw new Error("Household not found");
  }

  const financialCapital = household.Form?.Financialcapital;
  if (financialCapital?.Savings) {
    // คำนวณผลรวมของ amount
    const totalAmount = financialCapital.Savings.reduce(
      (sum, saving) => sum + (saving.amount || 0),
      0
    );

    // เพิ่มผลรวมใน response
    return {
      ...household.toJSON(), // แปลงข้อมูล household เป็น JSON
      totalAmount, // ผลรวมของ amount
    };
  }

  return household;
};

exports.findDebt = async (householdId) => {
  const household = await household_model.findOne({
    where: { id: householdId },
    include: [
      {
        model: form_model,
        include: [
          {
            model: financialcapital_model,
            include: [
              {
                model: debt_model,
                include: [
                  {
                    model: creditsources_model, // Include Creditsources
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!household) {
    throw new Error("Household not found");
  }
  const financialCapital = household.Form?.Financialcapital;
  if (financialCapital?.Debt?.Creditsources) {
    totalDebt = financialCapital.Debt.Creditsources.reduce(
      (sum, creditSource) => sum + (creditSource.outstanding_amount || 0),
      0
    );
    // ส่งข้อมูลกลับพร้อมยอดรวม
    return {
      ...household.toJSON(),
      totalDebt,
    };
  }

  return household;
};

exports.countMemberHouseHold = async (householdId) => {
  try {
    // Find the household and include associated data
    const household = await household_model.findOne({
      where: { id: householdId },
      include: [
        {
          model: memberHousehold_model, // Direct relation with MemberHousehold
        },
      ],
    });

    // Check if the household exists
    if (!household) {
      throw new Error("Household not found");
    }

    // Count the number of members in the household
    const memberCount = await memberHousehold_model.count({
      where: { houseId: householdId },
    });

    return {
      household,
      memberCount,
    };
  } catch (error) {
    console.error("Error counting MemberHousehold entries:", error);
    throw error;
  }
};

exports.getAllFinancialData = async (householdId) => {
  try {
    // Find the household and include associated data
    const household = await household_model.findOne({
      where: { id: householdId },
      include: [
        {
          model: memberHousehold_model, // Direct relation with MemberHousehold
        },
        {
          model: form_model,
          include: [
            {
              model: physicalCapital_model,
            },
            {
              model: financialcapital_model,
              include: [
                {
                  model: householdexpenses_model, // เชื่อมกับ Householdexpenses
                },
                {
                  model: nonAgiIncome_model, // เชื่อมกับ NonAGIincome
                },
                {
                  model: AGI_financial_model, //เชื่อมต่อรายรับจากการเกษตร
                },
                {
                  model: saving_model, // เชื่อมกับ Saving
                },
                {
                  model: debt_model, // เชื่อมกับ Debt
                  include: [
                    {
                      model: creditsources_model, // เชื่อมกับ Creditsources
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Check if the household exists
    if (!household) {
      throw new Error("Household not found");
    }

    // Count the number of members in the household
    const memberCount = await memberHousehold_model.count({
      where: { houseId: householdId },
    });

    //นับจำนวนการช่วยเหลือทั้งหมดในครัวเรือน
    const household_help = await memberHousehold_model.findAll({
      where:{
        houseId:householdId
      },
      include:[
        {
          model:help_member_model,
          attributes:['id']
        }
      ]
    })
    const totalHelped =  household_help.reduce((total,member)=>{
      return total + member.HelpMembers.length;
    },0)

    const financialCapital = household.Form?.Financialcapital;

    // Calculate expenses (เฉพาะข้อมูลล่าสุด)
    let totalExpenses = 0;
    if (financialCapital?.Householdexpenses) {
      // เรียงลำดับ Householdexpenses ตาม createdAt จากใหม่ไปเก่า
      const sortedExpenses = financialCapital.Householdexpenses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // หา createdAt ของข้อมูลล่าสุด
      const latestCreatedAt = sortedExpenses[0]?.createdAt;

      // กรองข้อมูลเฉพาะชุดล่าสุด
      const latestExpenses = sortedExpenses.filter(
        (expense) => expense.createdAt.getTime() === latestCreatedAt.getTime()
      );

      // คำนวณ totalExpenses จากข้อมูลล่าสุด
      totalExpenses = latestExpenses.reduce(
        (sum, expense) => sum + (expense.amount_per_month || 0),
        0
      );
    }

    // Calculate income (เฉพาะข้อมูลล่าสุด ของรายได้นอกการเกษตร)
    let totalAmountPerYear = 0;
    let totalCostPerYear = 0;
    if (financialCapital?.NonAGIincomes) {
      // เรียงลำดับ NonAGIincomes ตาม createdAt จากใหม่ไปเก่า
      const sortedIncomes = financialCapital.NonAGIincomes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // หา createdAt ของข้อมูลล่าสุด
      const latestCreatedAt = sortedIncomes[0]?.createdAt;

      // กรองข้อมูลเฉพาะชุดล่าสุด
      const latestIncomes = sortedIncomes.filter(
        (income) => income.createdAt.getTime() === latestCreatedAt.getTime()
      );

      // คำนวณ totalAmountPerYear และ totalCostPerYear จากข้อมูลล่าสุด
      totalAmountPerYear = latestIncomes.reduce(
        (sum, income) => sum + (income.amount_per_year || 0),
        0
      );
      totalCostPerYear = latestIncomes.reduce(
        (sum, income) => sum + (income.cost_per_year || 0),
        0
      );
    }

    //Cal รายได้จากการเกษตร
    let totalAGIincomePerYear = 0;
    if (
      financialCapital?.AGIFinancials &&
      financialCapital.AGIFinancials.length > 0
    ) {
      //เรียงลำดับเอาอันล่าสุดออกมา
      const sortedAGIincome = financialCapital.AGIFinancials.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // ตรวจสอบว่ามีข้อมูลหลังจากเรียงแล้ว
      if (sortedAGIincome.length > 0) {
        totalAGIincomePerYear = sortedAGIincome[0].amount_per_year || 0;
      }
    }

    // Calculate savings
    let totalSaving = 0;
    if (financialCapital?.Savings) {
      totalSaving = financialCapital.Savings.reduce(
        (sum, saving) => sum + (saving.amount || 0),
        0
      );
    }

    // Calculate debts
    let totalDebt = 0;
    if (financialCapital?.Debt?.Creditsources) {
      totalDebt = financialCapital.Debt.Creditsources.reduce(
        (sum, creditSource) => sum + (creditSource.outstanding_amount || 0),
        0
      );
    }

    // Return the combined data
    return {
      ...household.toJSON(), // Convert household data to JSON
      totalHelped,
      financialSummary: {
        totalExpenses, // Total expenses (เฉพาะข้อมูลล่าสุด)
        totalAmountPerYear, //รายได้นอกการเกษตรล่าสุด
        totalAGIincomePerYear: totalAGIincomePerYear, //รายได้จากการเกษตร
        totalIncomePerYear: totalAmountPerYear + totalAGIincomePerYear , //รายได้รวม นอก+ใน การเกษตรล่าสุด
        totalCostPerYear, // Total annual cost (เฉพาะข้อมูลล่าสุด)
        totalSaving, // Total savings
        totalDebt, // Total debt
      },
      memberCount, // Total members in the household
    };
  } catch (error) {
    console.error("Error fetching financial data and member count:", error);
    throw error;
  }
};
