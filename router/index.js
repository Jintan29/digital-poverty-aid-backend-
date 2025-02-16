const express = require('express');
const router = express.Router();

const authRoute = require('./auth/auth.route')
const formRoute = require('./form/form.route')
const householdRoute = require('./household/household.route')
const memberHouseRoute = require('./memberHousehold/member.household.route')
const teamServeyRoute = require('./teamservey/teamservey.route')
const memberactivityRoute = require('./MemberActivitie/memberActivitie.route');
const informantRoute = require('./Informant/informant.route')
const houseHoldProblemRoute = require('./HouseHoldProblem/houseHoldProblem.route')
const humancapitalRoute = require('./Humancapital/humancapital.route')
const socialWelfareRoute = require('./SocialWelfare/SocialWelfare.route')
const financialcapitalRoute = require('./FinancialCapital/FinancialCapital.route')
const occupationalpropertyRoute = require('./Occupationalproperty/occupationalproperty.route')
const savingRoute = require('./Saving/saving.route')
const nonAGIincomeRoute = require('./NonAGIincome/nonAGIincome.route')
const houseHoldexpensesRoute = require('./Householdexpenses/householdexpenses.route')
const debtRoute = require('./Debt/Debt.router')
const creditsourcesRoute = require('./Creditsources/Creditsources.router')
const physicalCapitalRoute = require('./PhysicalCapital/PhysicalCapital.route')
const houseHygineRoute = require('./HouseHygiene/HouseHygiene.route')
const utilWaterRoute = require('./UtilityWater/UtilityWater.route')
const urbanAreaRoute = require('./UrbanArea/UrbanArea.route')
const unresIn3Southern = require('./UnrestIn3Southern/UnrestIn3Southern.route')
const agriculturalincomeRoute = require('./agriculturalincome/agriculturalincome.route')
const socialcapitalRoute = require('./Socialcapital/socialcapital.route')
const activitygrouptypeRoute = require('./Activitygrouptype/activitygrouptype.route')
const activitytypeRoute = require('./Activityrtype/activitytype.route')
const naturalresourcecapitalRoute = require('./Naturalresourcecapital/naturalresourcecapital')
const pbresourceforliveRoute = require('./Pbresourceforlive/pbresourceforlive.route')
const pbincomeRoute = require('./Pbresourceforincome/pbresourceforincome.route')
const farmlandindisasterareasRoute = require('./Farmlandindisasterareas/farmlandindisasterareas.route')
const houseindisasterareasRoute = require('../router/Houseindisasterareas/houseindisasterareas.route')
const unrestIn3Southern = require('./UnrestIn3Southern/UnrestIn3Southern.route')
const suggestions = require('./Suggestions/Suggestions.route')
const user = require('./User/User.route')
const mail = require('./Mail/Mail.route')
const MemberFinancial = require('./MemberFinancial/memberFinancial.route')
const Career = require('./Career/career.route')
const LineOA = require('./LineOA/LineOA.route')
const AGIFinancial = require('./AGIFinancial/AGIFinancial.route')
const ExportExcel = require('./ExportExcel/ExportExcel.route')
const formInsertAll = require('./FormInsertAll/form.insert.all')
const District = require('../router/District/district.router');
const HelpMember = require('./HelpMember/HelpMember.route')

//TEST
const AdminLog = require("./AdminLog/AdminLog.route")


const RouterList = [
    {
        path: '/auth',
        route: authRoute
    },
    {
        path: '/form',
        route: formRoute
    },
    {
        path: '/house-hold',
        route: householdRoute
    },
    {
        path: '/member-household',
        route: memberHouseRoute
    },
    {
        path: '/team-servey',
        route: teamServeyRoute
    }, {
        path: '/memberactivity',
        route: memberactivityRoute
    },
    {
        path: '/informant',
        route: informantRoute
    },
    {
        path: '/houseHoldProblem',
        route: houseHoldProblemRoute
    },
    {
        path: '/human-capital',
        route: humancapitalRoute
    },
    {
        path: '/social-welfare',
        route: socialWelfareRoute
    },
    {
        path: '/financialCapital',
        route: financialcapitalRoute
    },
    {
        path: '/occupationalproperty',
        route: occupationalpropertyRoute
    },
    {
        path: '/saving',
        route: savingRoute
    }
    ,
    {
        path: '/nonAGI',
        route: nonAGIincomeRoute
    }
    ,
    {
        path: '/houseHoldexpenses',
        route: houseHoldexpensesRoute
    },
    {
        path: '/debt',
        route: debtRoute
    },
    {
        path: '/creditsources',
        route: creditsourcesRoute
    },
    {
        path: '/physical-capital',
        route:physicalCapitalRoute
    },
    {
        path: '/house-hygiene',
        route:houseHygineRoute
    },
    {
        path: '/util-water',
        route:utilWaterRoute
    },
    {
        path: '/urban-area',
        route:urbanAreaRoute
    },
    {
        path: '/unresIn-3Southern',
        route:unresIn3Southern
    },{
        path: '/agriculturalincome',
        route: agriculturalincomeRoute
    },
    {
        path: '/socialcapital',
        route: socialcapitalRoute
    },
    {
        path: '/activitygrouptype',
        route: activitygrouptypeRoute
    },
    {
        path: '/activitytype',
        route: activitytypeRoute
    },
    {
        path: '/naturalresourcecapital',
        route: naturalresourcecapitalRoute
    },
    {
        path: '/pbresourceforlive',
        route: pbresourceforliveRoute
    },
    {
        path: '/pbincome',
        route: pbincomeRoute
    },
    {
        path: '/farmlandindisasterareas',
        route: farmlandindisasterareasRoute
    },
    {
        path: '/houseindisasterareas',
        route:houseindisasterareasRoute
    },
    {
        path: '/unrestIn-3Southern',
        route:unrestIn3Southern
    },
    {
        path: '/suggestions',
        route:suggestions
    },
    {
        path: '/formInsertAll',
        route:formInsertAll
    },
    {
        path: '/user',
        route:user
    },
    {
        path: '/mail',
        route:mail
    },
    {
        path: '/member-financial',
        route:MemberFinancial
    },
    {
        path: '/career',
        route:Career
    },
    {
        path: '/line-oa',
        route:LineOA
    },
    {
        path: '/district',
        route:District
    },
    {
        path: '/agi-financial',
        route:AGIFinancial
    },
    {
        path:'/export',
        route:ExportExcel
    },
    {
        path:'/help-member',
        route:HelpMember
    },
    {
        path:'/log',
        route:AdminLog
    }

    
    

];

RouterList.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;