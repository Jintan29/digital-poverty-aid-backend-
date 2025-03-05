const { where } = require("sequelize");
const db = require("../models");
const logService = require("./log.service");
const household_model = db.Household;
const form_model = db.Form;
const nonAgiIncome_model = db.NonAGIincome
const financialcapital_model = db.Financialcapital;
const householdexpenses_model = db.Householdexpenses
const saving_model = db.Saving
const debt_model = db.Debt
const creditsources_model = db.Creditsources
const memberHouse_model = db.MemberHousehold;
const socialWelfare_model = db.SocialWelfare;
const carrer_model = db.Career;
const memberfinancial_model = db.MemberFinancial;
const physical_model = db.PhysicalCapital;
exports.getCapital = async () => {
  try {
    const capitals = await physical_model.findAll({ include: form_model });

    return capitals.map(capital => ({
      ...capital.toJSON(), // Convert Sequelize object to JSON
      lat: parseFloat(capital.lat),
      lon: parseFloat(capital.lon)
    }));
  } catch (err) {
    console.error("Error in getCapital:", err);
    throw err;
  }
};

exports.getHouse = () => {
  try {
    return household_model.findAll({ include: form_model });
  } catch (err) {
    return err;
  }
};


exports.findOneById = async (id) => {
  return household_model.findOne({
    where: { id: id },
  });
};

exports.create = async (houseObj) => {
  try {
    return await household_model.create(houseObj);
  } catch (err) {
    console.log(err);
  }
};

exports.update = async (houseObj, id) => {
  try {
    const result = await household_model.update(
      houseObj,
      {
        where: { id: id },
        returning: true, // ✅ ให้ Sequelize คืนค่าข้อมูลที่อัปเดต
      }
    );
    return result; // Sequelize update() จะคืนค่าเป็น [1] ถ้าอัปเดตสำเร็จ
  } catch (error) {
    throw error;
  }
};


exports.deleted = async (id) => {
  await household_model
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


// Service function: นับจำนวนข้อมูลใน household_model
exports.countHouseholds = async () => {
  try {
    // ใช้ Sequelize's count() method เพื่อคำนวณจำนวนแถวทั้งหมดใน household_model
    return await household_model.count();
  } catch (err) {
    // หากเกิดข้อผิดพลาด ให้พิมพ์ข้อความแสดงข้อผิดพลาดลงใน console และส่ง error กลับไป
    console.log(err);
    return err;
  }
};


exports.countHouseholdsByDistrict = async () => {
  try {
    return await household_model.findAll({
      attributes: [
        'district',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['district']
    });
  } catch (err) {
    console.error(err);
    return err;
  }
};

exports.createNonAgiIncome = async (householdId, nonAgiIncomeDataArray, adminId) => {
  try {
    // Find the household by ID
    const household = await household_model.findByPk(householdId, {
      include: [
        {
          model: form_model,
        },
      ],
    });

    if (!household) {
      throw new Error("Household not found");
    }

    const form = household.Form;
    if (!form) {
      throw new Error("No associated form found for the household");
    }

    const financialCapital = await financialcapital_model.findOne({
      where: { formId: form.id },
    });

    if (!financialCapital) {
      throw new Error("No associated financialcapital found in the form");
    }

    // Validate input: Ensure the data is an array
    if (!Array.isArray(nonAgiIncomeDataArray)) {
      throw new Error("Input data must be an array");
    }

    // Create all NonAGIincome records and associate them with the financialcapital
    const newNonAgiIncomeRecords = await Promise.all(
      nonAgiIncomeDataArray.map(async (nonAgiIncomeData) => {
        const record = await nonAgiIncome_model.create({
          ...nonAgiIncomeData,
          finan_capital_id: financialCapital.id,
          editBy: adminId,
        });
        await logService.createLog(adminId, "เพิ่มข้อมูลรายรับนอกภาคเกษตรของครัวเรือน", "NonAGIincome", record.id, household.house_code);
        return record;
      })
    );


    return {
      success: true,
      data: newNonAgiIncomeRecords,
      message: "NonAGIincome records created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};


exports.createHouseholdExpenses = async (householdId, householdExpensesDataArray, adminId) => {
  try {
    // Find the household by ID
    const household = await household_model.findByPk(householdId, {
      include: [
        {
          model: form_model,
        },
      ],
    });

    if (!household) {
      throw new Error("Household not found");
    }

    const form = household.Form;
    if (!form) {
      throw new Error("No associated form found for the household");
    }

    const financialCapital = await financialcapital_model.findOne({
      where: { formId: form.id },
    });

    if (!financialCapital) {
      throw new Error("No associated financialcapital found in the form");
    }

    // Validate input: Ensure the data is an array
    if (!Array.isArray(householdExpensesDataArray)) {
      throw new Error("Input data must be an array");
    }
    // Create the new Householdexpenses and associate it with the financialcapital
    const newHouseholdExpenses = await Promise.all(
      householdExpensesDataArray.map(async (householdExpensesData) => {
        const record = await householdexpenses_model.create({
          ...householdExpensesData,
          finan_capital_id: financialCapital.id,
          editBy: adminId,
        });
        await logService.createLog(adminId, "เพิ่มข้อมูลค่าใช้จ่ายของครัวเรือน", "Householdexpenses", record.id,household.house_code);
        return record;
      })
    )

    return {
      success: true,
      data: newHouseholdExpenses,
      message: "Householdexpenses created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

exports.createSaving = async (householdId, savingDataArray, adminId) => {
  try {
    // Find the household by ID
    const household = await household_model.findByPk(householdId, {
      include: [
        {
          model: form_model,
        },
      ],
    });

    if (!household) {
      throw new Error("Household not found");
    }

    const form = household.Form;
    if (!form) {
      throw new Error("No associated form found for the household");
    }

    const financialCapital = await financialcapital_model.findOne({
      where: { formId: form.id },
    });

    if (!financialCapital) {
      throw new Error("No associated financialcapital found in the form");
    }

    // Validate input: Ensure the data is an array
    if (!Array.isArray(savingDataArray)) {
      throw new Error("Input data must be an array");
    }

    // Create the new Saving and associate it with the financialcapital
    const newSaving = await Promise.all(
      savingDataArray.map(async (savingData) => {
        const record = await saving_model.create({
          ...savingData,
          finan_capital_id: financialCapital.id,
          editBy: adminId,
        })
        await logService.createLog(adminId, "เพิ่มข้อมูลการออมของครัวเรือน", "Saving", record.id , household.house_code)

        return record
      })
    )



    return {
      success: true,
      data: newSaving,
      message: "Saving created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

exports.createCreditsource = async (householdId, creditsourceDataArray, adminId) => {
  try {
    // Find the household by ID
    const household = await household_model.findByPk(householdId, {
      include: [
        {
          model: form_model,
        },
      ],
    });

    if (!household) {
      throw new Error("Household not found");
    }

    const form = household.Form;
    if (!form) {
      throw new Error("No associated form found for the household");
    }

    const financialCapital = await financialcapital_model.findOne({
      where: { formId: form.id },
    });

    if (!financialCapital) {
      throw new Error("No associated financialcapital found in the form");
    }

    // Fetch the associated Debt model
    const debt = await debt_model.findOne({
      where: { finan_capital_id: financialCapital.id },
    });

    if (!debt) {
      throw new Error("No associated debt found for the financial capital");
    }

    if (!Array.isArray(creditsourceDataArray)) {
      throw new Error("Input data must be an array");
    }

    const newCreditsource = await Promise.all(
      creditsourceDataArray.map(async (creditsourceData) => {
        const record = await creditsources_model.create({
          ...creditsourceData,
          debt_id: debt.id,
          editBy: adminId,
        })
        await logService.createLog(adminId, "เพิ่มข้อมูลแหล่งเงินกู้ของครัวเรือน", "Creditsources", record.id,household.house_code)

        return record
      })
    );
    // Create the new creditsource and associate it with the debt
    // const newCreditsource = await creditsources_model.create({
    //   ...creditsourceData,
    //   debt_id: debt.id, // Adjust the key name to match your model
    // });

    return {
      success: true,
      data: newCreditsource,
      message: "Creditsource created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

exports.createMember = async (householdId, memberDataArray, adminId) => {
  try {
    // ค้นหา household ตาม householdId
    const household = await household_model.findByPk(householdId);

    if (!household) {
      throw new Error("Household not found");
    }

    // ตรวจสอบว่า input เป็น array หรือไม่
    if (!Array.isArray(memberDataArray)) {
      throw new Error("Input data must be an array");
    }

    // ใช้ Transaction เพื่อให้แน่ใจว่าการสร้างข้อมูลเป็นไปอย่างปลอดภัย
    const transaction = await db.sequelize.transaction();

    try {
      // ใช้ Promise.all() เพื่อสร้างสมาชิกทั้งหมด
      const newMemberRecords = await Promise.all(
        memberDataArray.map(async (memberData) => {
          // สร้าง MemberHousehold
          const newMember = await memberHouse_model.create(
            {
              ...memberData,
              houseId: household.id,
              editBy: adminId,
            },
            { transaction }
          );

          // ถ้ามีข้อมูล SocialWelfare และเป็น array ให้สร้างทั้งหมด
          if (Array.isArray(memberData.SocialWelfare)) {
            await Promise.all(
              memberData.SocialWelfare.map(async (welfareData) => {
                await socialWelfare_model.create(
                  {
                    ...welfareData,
                    member_house_id: newMember.id, // เชื่อมโยงกับ MemberHousehold
                  },
                  { transaction }
                );
              })
            );
          }

          // ถ้ามีข้อมูล Career และเป็น array ให้สร้างทั้งหมด
          if (Array.isArray(memberData.Career)) {
            await Promise.all(
              memberData.Career.map(async (careerData) => {
                await carrer_model.create(
                  {
                    ...careerData,
                    member_house_id: newMember.id, // เชื่อมโยงกับ MemberHousehold
                  },
                  { transaction }
                );
              })
            );
          }

          // ถ้ามีข้อมูล MemberFinancial ให้สร้าง
          if (memberData.MemberFinancial) {
            await memberfinancial_model.create(
              {
                ...memberData.MemberFinancial,
                member_house_id: newMember.id, // เชื่อมโยงกับ MemberHousehold
              },
              { transaction }
            );
          }

          return newMember;
        })
      );

      // Commit Transaction ถ้าทุกอย่างสำเร็จ
      await transaction.commit();
      await Promise.all(
        newMemberRecords.map(async (member) => {
          await logService.createLog(adminId, "เพิ่มสมาชิกใหม่ในครัวเรือน", "MemberHousehold", member.id,household.house_code);
        })
      );

      return {
        success: true,
        data: newMemberRecords,
        message: "Member records created successfully with Career & SocialWelfare",
      };
    } catch (error) {
      // Rollback ถ้ามีข้อผิดพลาด
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

exports.createPin = async (householdId, lat, lon, adminId) => {
  try {
    // Find the Household
    const household = await household_model.findOne({
      where: { id: householdId },
      include: [{ model: physical_model }],
    });

    if (!household) {
      throw new Error("Household not found");
    }

    // Get associated PhysicalCapital
    let physicalCapital = await physical_model.findOne({
      where: { houseId: householdId }
    });

    // If PhysicalCapital does not exist, create a new entry
    if (!physicalCapital) {
      physicalCapital = await physical_model.create({
        houseId: householdId,
        lat,
        lon,
        editBy: adminId,
      });
    } else {
      // Update the existing PhysicalCapital entry
      physicalCapital.lat = lat;
      physicalCapital.lon = lon;
      physicalCapital.editBy = adminId;
      await physicalCapital.save();
    }
    // บันทึก Log
    await logService.createLog(adminId, "เพิ่มตำแหน่งที่ตั้งของครัวเรือน", "PhysicalCapital", physicalCapital.id,household.house_code);

    return physicalCapital;
  } catch (error) {
    console.error("Error in createPin:", error);
    throw error;
  }
};
