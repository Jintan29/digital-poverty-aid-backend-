const db = require("../models");
const form_model = db.Form;
const housedole_model = db.Household;
const teamservey_model = db.TeamServey;
const Informant_model = db.Informant;
const MemberHouse_model = db.MemberHousehold;
const SocialWelfare_model = db.SocialWelfare;
const Career_model = db.Career;
const MemberFinancial_model = db.MemberFinancial;
// 2
const PhysicalCapital_model = db.PhysicalCapital;
const UrbanArea_model = db.UrbanArea;
const UtilityWater_model = db.UtilityWater;
const HouseHygiene_model = db.HouseHygiene;
//3
const Financialcapital_model = db.Financialcapital;
const Agriculturalincome_model = db.Agriculturalincome;
const Householdexpenses_model = db.Householdexpenses;
const NonAGIincome_model = db.NonAGIincome;
const Saving_model = db.Saving;
const Debt_model = db.Debt;
const Creditsources_model = db.Creditsources;
const Occupationalproperty_model = db.Occupationalproperty;
//4
const Naturalcapital_model = db.Naturalresourcecapital;
const PBresourceforincome_model = db.PBresourceforincome;
const PBresourceforlive_model = db.PBresourceforlive;
const Farmlandindisasterareas_model = db.Farmlandindisasterareas;
const HouseInDisasterAreas_model = db.HouseInDisasterAreas;
//5
const Socialcapital_model = db.Socialcapital;
const Activitygrouptype_model = db.Activitygrouptype;
const Activitytype_model = db.Activitytype;
//6-7
const UnrestIn3Southern_model = db.UnrestIn3Southern;
const Suggestion_model = db.Suggestion;

//validate type
const {
  formSchema,
} = require("../validators/FormInsertAll/form.insert.all.validator");

const create = async (req, res) => {
  const { error, value } = formSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      message: "Validation error",
      error: error.details,
    });
  }

  try {

    //chck HC
    const houseCode = await housedole_model.findOne({
      where:{
        house_code : value.Household.house_code
      }
    })

    if(houseCode){
      return res.status(400).send({message:`มีข้อมูลของ : ${value.Household.house_code} ในระบบอยู่แล้ว`})
    }

    // create by use transaction
    const result = await db.sequelize.transaction(async (t) => {
      //เริ่มสร้างข้อมูลลงทีละตาราง
      const Form = await form_model.create(
        {
          time_rec: value.time_rec,
          recder_title: value.recder_title,
          recder_fname: value.recder_fname,
          recder_lname: value.recder_lname,
          recder_phone: value.recder_phone,
        },
        { transaction: t }
      );

      const Household = await housedole_model.create(
        {
          house_code: value.Household.house_code,
          host_title: value.Household.host_title,
          host_fname: value.Household.host_fname,
          host_lname: value.Household.host_lname,
          host_national_id: value.Household.host_national_id,
          has_greenBook: value.Household.has_greenBook,
          green_book_id: value.Household.green_book_id,
          postcode: value.Household.postcode,
          subdistrict: value.Household.subdistrict,
          district: value.Household.district,
          province: value.Household.province,
          house_number: value.Household.house_number,
          village: value.Household.village,
          alley: value.Household.alley,
          road: value.Household.road,
          form_id: Form.id,
        },
        { transaction: t }
      );

      //loop สร้างหลายคน
      const TeamServeyPromise = await value.TeamServey.map(async (teamData) => {
        return await teamservey_model.create(
          {
            title: teamData.title,
            fname: teamData.fname,
            lname: teamData.lname,
            agency: teamData.agency,
            phone: teamData.phone,
            form_id: Form.id,
          },
          { transaction: t }
        );
      });
      const TeamServeyArray = await Promise.all(TeamServeyPromise);

      const Informant = await Informant_model.create(
        {
          title: value.Informant.title,
          fname: value.Informant.fname,
          lname: value.Informant.lname,
          national_id: value.Informant.national_id,
          phone: value.Informant.phone,
          fam_total_member: value.Informant.fam_total_member,
          fam_total_live: value.Informant.fam_total_live,
          total_has_name_not_live: value.Informant.total_has_name_not_live,
          live_but_has_no_name_in_fam:
            value.Informant.live_but_has_no_name_in_fam,
          form_id: Form.id,
        },
        { transaction: t }
      );

      const SocialWelfareArr = []; //รอสร้างข้อมูลเสร็จแล้วค่อยๆ push เข้ามา
      const CareerArr = [];

      const MemberHouseHoldPromise = await value.MemberHousehold.map(
        async (data) => {
          const memberHousehold = await MemberHouse_model.create(
            {
              title: data.title,
              fname: data.fname,
              lname: data.lname,
              sex: data.sex,
              national_id: data.national_id,
              phone: data.phone,
              age_yaer: data.age_yaer,
              age_month: data.age_month,
              birthdate: data.birthdate,
              status_in_house: data.status_in_house,
              health: data.health,
              work_can_made_income: data.work_can_made_income,
              max_education: data.max_education,
              current_edu_level: data.current_edu_level,
              edu_status: data.edu_status,
              edu_description: data.edu_description,
              work_status: data.work_status,
              can_write_TH: data.can_write_TH,
              can_read_TH: data.can_read_TH,
              can_speak_TH: data.can_speak_TH,
              is_leader: data.is_leader,
              still_poor: data.still_poor,
              houseId: Household.id,
              form_id: Form.id,
            },
            { transaction: t }
          );

          const MemberFinancial = await MemberFinancial_model.create(
            {
              agv_income: data.MemberFinancial.agv_income,
              avg_expenses: data.MemberFinancial.avg_expenses,
              inflation: data.MemberFinancial.inflation,
              member_house_id: memberHousehold.id,
            },
            { transaction: t }
          );

          //สร้าง Social welfare ต่อ
          if (data.SocialWelfare) {
            const SocialWelfarePromise = data.SocialWelfare.map(async (sw) => {
              const allSw = await SocialWelfare_model.create(
                {
                  welfare: sw.welfare,
                  amount: sw.amount,
                  frequency: sw.frequency,
                  member_house_id: memberHousehold.id,
                },
                { transaction: t }
              );
              SocialWelfareArr.push(allSw);
              return allSw;
            });
            await Promise.all(SocialWelfarePromise);
          }

          if (data.Career) {
            const CareerPromise = data.Career.map(async (career) => {
              const result = await Career_model.create(
                {
                  career_type: career.career_type,
                  member_house_id: memberHousehold.id,
                },
                { transaction: t }
              );
              CareerArr.push(result);
              return result;
            });
            await Promise.all(CareerPromise);
          }

          return {
            memberHousehold,
            MemberFinancial,
          };
        }
      );

      // รอให้ Promise ทั้งหมดเสร็จสิ้น
      const memberResults = await Promise.all(MemberHouseHoldPromise);
      //แยก member และ fianancial
      const MemberHouseHoldArr = memberResults.map(
        (result) => result.memberHousehold
      );
      const MemberFinancialArr = memberResults.map(
        (result) => result.memberFinancial
      );

      const PhysicalCapital = await PhysicalCapital_model.create(
        {
          lat: value.PhysicalCapital.lat,
          lon: value.PhysicalCapital.lon,
          is_has_house: value.PhysicalCapital.is_has_house,
          house_rent: value.PhysicalCapital.house_rent,
          house_status_law: value.PhysicalCapital.house_status_law,
          house_status: value.PhysicalCapital.house_status,
          electricity_status: value.PhysicalCapital.electricity_status,
          alternative_energy: value.PhysicalCapital.alternative_energy,
          has_home_phone: value.PhysicalCapital.has_home_phone,
          phone: value.PhysicalCapital.phone,
          water_for_agriculture: value.PhysicalCapital.water_for_agriculture,
          house_access_road: value.PhysicalCapital.house_access_road,
          workplace_access_road: value.PhysicalCapital.workplace_access_road,
          use_tech_get_benefit_gov:
            value.PhysicalCapital.use_tech_get_benefit_gov,
          benefit_form_tech: value.PhysicalCapital.benefit_form_tech,
          news: value.PhysicalCapital.news,
          agricultural_land: value.PhysicalCapital.agricultural_land,
          land_use_issuse: value.PhysicalCapital.land_use_issuse,
          form_id: Form.id,
          houseId: Household.id
        },
        { transaction: t }
      );

      const HouseHygiene = await HouseHygiene_model.create(
        {
          item_storage: value.PhysicalCapital.HouseHygiene.item_storage,
          drainage_system: value.PhysicalCapital.HouseHygiene.drainage_system,
          toilet: value.PhysicalCapital.HouseHygiene.toilet,
          garbage: value.PhysicalCapital.HouseHygiene.garbage,
          phy_capital_id: PhysicalCapital.id,
        },

        { transaction: t }
      );

      const UtilityWater = await UtilityWater_model.create(
        {
          plumbing_water: value.PhysicalCapital.UtilityWater.plumbing_water,
          water_other_sources:
            value.PhysicalCapital.UtilityWater.water_other_sources,
          water_purchase: value.PhysicalCapital.UtilityWater.water_purchase,
          phy_capital_id: PhysicalCapital.id,
        },
        { transaction: t }
      );

      const UrbanArea = await UrbanArea_model.create(
        {
          is_use_area_to_work:
            value.PhysicalCapital.UrbanArea.is_use_area_to_work,
          has_prolem_in_area:
            value.PhysicalCapital.UrbanArea.has_prolem_in_area,
          phy_capital_id: PhysicalCapital.id,
        },
        { transaction: t }
      );

      const Financialcapital = await Financialcapital_model.create(
        {
          formId: Form.id,
        },
        { transaction: t }
      );

      const AgriculturalincomePromise =
        value.Financialcapital.Agriculturalincome.map(async (data) => {
          return await Agriculturalincome_model.create(
            {
              plants: data.plants,
              livestock: data.livestock,
              fishing: data.fishing,
              finan_capital_id: Financialcapital.id,
            },
            { transaction: t }
          );
        });
      const AgriculturalincomeArr = await Promise.all(
        AgriculturalincomePromise
      );

      const NonAGIincomePromise = value.Financialcapital.NonAGIincome.map(
        async (data) => {
          return await NonAGIincome_model.create(
            {
              income_type: data.income_type,
              amount_per_year: data.amount_per_year,
              cost_per_year: data.cost_per_year,
              finan_capital_id: Financialcapital.id,
            },
            { transaction: t }
          );
        }
      );
      const NonAGIincomeArr = await Promise.all(NonAGIincomePromise);

      const SavingPromise = value.Financialcapital.Saving.map(async (data) => {
        return await Saving_model.create(
          {
            is_has_saving: data.is_has_saving,
            saving_type: data.saving_type,
            amount: data.amount,
            finan_capital_id: Financialcapital.id,
          },
          { transaction: t }
        );
      });
      const SavingArr = await Promise.all(SavingPromise);

      const CreditsourcesArr = []; //รอสร้างเสร็จแล้วเอามาใส่
      const DebtPromise = value.Financialcapital.Debt.map(async (data) => {
        const Debt = await Debt_model.create(
          {
            is_has_debt: data.is_has_debt,
            description: data.description,
            finan_capital_id: Financialcapital.id,
          },
          { transaction: t }
        );

        //เอา Dept id ไปสร้าง credit ต่อ
        const CreditsourcesPromise = value.Financialcapital.Creditsources.map(
          async (data) => {
            const creditRec = await Creditsources_model.create(
              {
                form: data.form,
                outstanding_amount: data.outstanding_amount,
                debt_id: Debt.id,
              },
              { transaction: t }
            );
            CreditsourcesArr.push(creditRec);
          }
        );
        const CreditsourcesArr2 = await Promise.all(CreditsourcesPromise);

        return Debt;
      });
      const DebtArr = await Promise.all(DebtPromise);

      const OccupationalpropertyPromise =
        value.Financialcapital.Occupationalproperty.map(async (data) => {
          return await Occupationalproperty_model.create(
            {
              is_has_property: data.is_has_property,
              property_type: data.property_type,
              finan_capital_id: Financialcapital.id,
            },
            { transaction: t }
          );
        });
      const OccupationalpropertyArr = await Promise.all(
        OccupationalpropertyPromise
      );

      const HouseholdexpensesPromise =
        value.Financialcapital.Householdexpenses.map(async (data) => {
          return await Householdexpenses_model.create(
            {
              expenses_type: data.expenses_type,
              amount_per_month: data.amount_per_month,
              finan_capital_id: Financialcapital.id,
            },
            { transaction: t }
          );
        });
      const HouseholdexpensesArr = await Promise.all(HouseholdexpensesPromise);

      const Naturalcapital = await Naturalcapital_model.create(
        {
          formId: Form.id,
        },
        { transaction: t }
      );

      const PBresourceforincomePromise =
        value.Naturalcapital.PBresourceforincome.map(async (data) => {
          return await PBresourceforincome_model.create(
            {
              is_use_PB_resoc: data.is_use_PB_resoc,
              rescource: data.rescource,
              distanceKM: data.distanceKM,
              description: data.description,
              national_res_id: Naturalcapital.id,
            },
            { transaction: t }
          );
        });
      const PBresourceforincomeArr = await Promise.all(
        PBresourceforincomePromise
      );

      const PBresourceforlivePromise =
        value.Naturalcapital.PBresourceforlive.map(async (data) => {
          return await PBresourceforlive_model.create(
            {
              is_use_PB_resoc: data.is_use_PB_resoc,
              rescource: data.rescource,
              distanceKM: data.distanceKM,
              description: data.description,
              national_res_id: Naturalcapital.id,
            },
            { transaction: t }
          );
        });

      const PBresourceforliveArr = await Promise.all(PBresourceforlivePromise);

      const FarmlandindisasterareasPromise =
        value.Naturalcapital.Farmlandindisasterareas.map(async (data) => {
          return Farmlandindisasterareas_model.create(
            {
              is_in_disaster: data.is_in_disaster,
              disaster_type: data.disaster_type,
              frequncy_disaster: data.frequncy_disaster,
              disaster_response: data.disaster_response,
              national_res_id: Naturalcapital.id,
            },
            { transaction: t }
          );
        });
      const FarmlandindisasterareasArr = await Promise.all(
        FarmlandindisasterareasPromise
      );

      const HouseInDisasterAreasPromise =
        value.Naturalcapital.HouseInDisasterAreas.map(async (data) => {
          return HouseInDisasterAreas_model.create(
            {
              is_in_disaster: data.is_in_disaster,
              disaster_type: data.disaster_type,
              frequncy_disaster: data.frequncy_disaster,
              disaster_response: data.disaster_response,
              national_res_id: Naturalcapital.id,
            },
            { transaction: t }
          );
        });
      const HouseInDisasterAreasArr = await Promise.all(
        HouseInDisasterAreasPromise
      );

      const Socialcapital = await Socialcapital_model.create(
        { formId: Form.id },
        { transaction: t }
      );

      const ActivitygrouptypePromise =
        value.Socialcapital.Activitygrouptype.map(async (data) => {
          return Activitygrouptype_model.create(
            {
              activity_group: data.activity_group,
              is_member: data.is_member,
              dependency: data.dependency,
              social_cap_id: Socialcapital.id,
            },
            { transaction: t }
          );
        });

      const ActivitygrouptypeArr = await Promise.all(ActivitygrouptypePromise);

      const ActivitytypePromise = value.Socialcapital.Activitytype.map(
        async (data) => {
          return Activitytype_model.create(
            {
              activity: data.activity,
              participation_level: data.participation_level,
              frequncy: data.frequncy,
              social_cap_id: Socialcapital.id,
            },
            { transaction: t }
          );
        }
      );
      const ActivitytypeArr = await Promise.all(ActivitytypePromise);

      const UnrestIn3Southern = await UnrestIn3Southern_model.create(
        {
          effect: value.UnrestIn3Southern.effect,
          urgent_to_do: value.UnrestIn3Southern.urgent_to_do,
          effect_in_life: value.UnrestIn3Southern.effect_in_life,
          effect_in_work: value.UnrestIn3Southern.effect_in_work,
          form_id: Form.id,
        },
        { transaction: t }
      );

      const Suggestion = await Suggestion_model.create(
        {
          suggest_informer: value.Suggestion.suggest_informer,
          suggest_surway_team: value.Suggestion.suggest_surway_team,
          resource: value.Suggestion.resource,
          form_id: Form.id,
        },
        { transaction: t }
      );

      return {
        Form,
        Household,
        TeamServeyArray,
        Informant,
        MemberHouseHoldArr,
        MemberFinancialArr,
        SocialWelfareArr,
        CareerArr,
        PhysicalCapital,
        HouseHygiene,
        UtilityWater,
        UrbanArea,
        Financialcapital,
        AgriculturalincomeArr,
        NonAGIincomeArr,
        SavingArr,
        DebtArr,
        CreditsourcesArr,
        OccupationalpropertyArr,
        HouseholdexpensesArr,
        Naturalcapital,
        PBresourceforincomeArr,
        PBresourceforliveArr,
        FarmlandindisasterareasArr,
        HouseInDisasterAreasArr,
        Socialcapital,
        ActivitygrouptypeArr,
        ActivitytypeArr,
        UnrestIn3Southern,
        Suggestion,
      };
    });

    return res.status(201).send({ result: result, message: "success" });
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
};

module.exports = {
  create,
};
