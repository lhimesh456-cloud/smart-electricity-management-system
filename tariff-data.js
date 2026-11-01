 
"use strict";

/*
 * SMART ELECTRICITY MANAGEMENT SYSTEM
 * FILE: tariff-data.js
 *
 * IMPORTANT:
 * The rates in this file are demonstration values only.
 * They are NOT verified official electricity tariffs.
 *
 * Update them using the latest official tariff orders
 * before presenting actual bill estimates.
 */

const TARIFF_DATA = Object.freeze({

    metadata: {
        projectName: "Smart Electricity Management System",
        version: "1.0",
        currency: "INR",
        unit: "kWh",
        dataType: "DEMONSTRATION",
        officialRatesVerified: false,
        billingNote:
            "Illustrative rates only. Not suitable for actual billing."
    },

    states: {

        AP: {
            name: "Andhra Pradesh",

            discoms: [
                "APEPDCL",
                "APSPDCL"
            ],

            districts: [
                "Alluri Sitharama Raju",
                "Anakapalli",
                "Anantapur",
                "Annamayya",
                "Bapatla",
                "Chittoor",
                "Dr B R Ambedkar Konaseema",
                "East Godavari",
                "Eluru",
                "Guntur",
                "Kakinada",
                "Krishna",
                "Kurnool",
                "Nandyal",
                "NTR",
                "Palnadu",
                "Parvathipuram Manyam",
                "Prakasam",
                "Sri Potti Sriramulu Nellore",
                "Sri Sathya Sai",
                "Srikakulam",
                "Tirupati",
                "Visakhapatnam",
                "Vizianagaram",
                "West Godavari",
                "YSR Kadapa"
            ],

            domestic: {
                demonstrationRate: 5.00,
                fixedChargePerMonth: 50,
                billingPeriodOptions: [1, 2],
                rateType: "Flat demonstration rate"
            }
        },

        TS: {
            name: "Telangana",

            discoms: [
                "TGSPDCL",
                "TGNPDCL"
            ],

            districts: [
                "Adilabad",
                "Bhadradri Kothagudem",
                "Hanamkonda",
                "Hyderabad",
                "Jagtial",
                "Jangaon",
                "Jayashankar Bhupalpally",
                "Jogulamba Gadwal",
                "Kamareddy",
                "Karimnagar",
                "Khammam",
                "Kumuram Bheem",
                "Mahabubabad",
                "Mahabubnagar",
                "Mancherial",
                "Medak",
                "Medchal-Malkajgiri",
                "Mulugu",
                "Nagarkurnool",
                "Nalgonda",
                "Narayanpet",
                "Nirmal",
                "Nizamabad",
                "Peddapalli",
                "Rajanna Sircilla",
                "Rangareddy",
                "Sangareddy",
                "Siddipet",
                "Suryapet",
                "Vikarabad",
                "Wanaparthy",
                "Warangal",
                "Yadadri Bhuvanagiri"
            ],

            domestic: {
                demonstrationRate: 5.20,
                fixedChargePerMonth: 60,
                billingPeriodOptions: [1, 2],
                rateType: "Flat demonstration rate"
            }
        },

        TN: {
            name: "Tamil Nadu",

            discoms: [
                "TNPDCL"
            ],

            districts: [
                "Ariyalur",
                "Chengalpattu",
                "Chennai",
                "Coimbatore",
                "Cuddalore",
                "Dharmapuri",
                "Dindigul",
                "Erode",
                "Kallakurichi",
                "Kancheepuram",
                "Kanniyakumari",
                "Karur",
                "Krishnagiri",
                "Madurai",
                "Mayiladuthurai",
                "Nagapattinam",
                "Namakkal",
                "Nilgiris",
                "Perambalur",
                "Pudukkottai",
                "Ramanathapuram",
                "Ranipet",
                "Salem",
                "Sivaganga",
                "Tenkasi",
                "Thanjavur",
                "Theni",
                "Thoothukudi",
                "Tiruchirappalli",
                "Tirunelveli",
                "Tirupathur",
                "Tiruppur",
                "Tiruvallur",
                "Tiruvannamalai",
                "Tiruvarur",
                "Vellore",
                "Viluppuram",
                "Virudhunagar"
            ],

            domestic: {
                demonstrationRate: 4.80,
                fixedChargePerMonth: 40,
                billingPeriodOptions: [1, 2],
                rateType: "Flat demonstration rate"
            }
        }
    }
});


/* ==========================================
   HELPER FUNCTIONS
========================================== */

/*
 * Get all available state codes.
 */
function getAvailableStates() {
    return Object.keys(TARIFF_DATA.states);
}


/*
 * Get state name.
 */
function getStateName(stateCode) {
    const state = TARIFF_DATA.states[stateCode];

    return state ? state.name : null;
}


/*
 * Get districts for a state.
 */
function getDistricts(stateCode) {
    const state = TARIFF_DATA.states[stateCode];

    return state ? [...state.districts] : [];
}


/*
 * Get distribution companies for a state.
 */
function getDiscoms(stateCode) {
    const state = TARIFF_DATA.states[stateCode];

    return state ? [...state.discoms] : [];
}


/*
 * Get domestic demonstration tariff.
 */
function getDomesticTariff(stateCode) {
    const state = TARIFF_DATA.states[stateCode];

    if (!state) {
        return null;
    }

    return {
        ...state.domestic
    };
}


/*
 * Check whether a district belongs to a state.
 */
function isValidDistrict(stateCode, districtName) {
    const state = TARIFF_DATA.states[stateCode];

    if (!state || typeof districtName !== "string") {
        return false;
    }

    return state.districts.includes(districtName);
}


/*
 * Check whether a DISCOM belongs to a state.
 */
function isValidDiscom(stateCode, discomName) {
    const state = TARIFF_DATA.states[stateCode];

    if (!state || typeof discomName !== "string") {
        return false;
    }

    return state.discoms.includes(discomName);
}


/*
 * Get project tariff information.
 */
function getTariffMetadata() {
    return { ...TARIFF_DATA.metadata };
}


/*
 * Display a tariff data summary in the browser console.
 */
function displayTariffSummary() {
    console.table(
        getAvailableStates().map(code => {
            const state = TARIFF_DATA.states[code];

            return {
                Code: code,
                State: state.name,
                Districts: state.districts.length,
                DISCOMs: state.discoms.join(", "),
                DemonstrationRate:
                    state.domestic.demonstrationRate
            };
        })
    );

    console.info(
        "Official tariff verification:",
        TARIFF_DATA.metadata.officialRatesVerified
    );
}


/* ==========================================
   FILE INITIALIZATION
========================================== */

console.info(
    "Smart Electricity Management tariff data loaded."
);
