const initials = {
    items: [],
    loading: false,
    error: null,
    facility_request: [],
    vechicle_request: [],
    job_request: [],
    purchase_request: [],
};

const actions = {
    // fetching
    fetch_request: "fetch_request",
    fetch_success: "fetch_success",
    fetch_error: "fetch_error",
    fetch_facility_request: "fetch_facility_request",
    fetch_vehicle_request: "fetch_vehicle_request",
    fetch_job_request: "fetch_job_request",
    fetch_purchase_request: "fetch_purchase_request",

    //create

    //update

    //delete
};

const reducer = (state, action) => {
    switch (action.type) {
        case actions.fetch_request:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case actions.fetch_success:
            return {
                ...state,
                loading: false,
                items: action.payload,
            };

        case actions.fetch_error:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case actions.fetch_facility_request:
            return {
                ...state,
                loading: false,
                facility_request: action.payload,
            };

        case actions.fetch_vehicle_request:
            return {
                ...state,
                loading: false,
                vechicle_request: action.payload,
            };
        case actions.fetch_job_request:
            return {
                ...state,
                loading: false,
                job_request: action.payload,
            };

        case actions.fetch_purchase_request:
            return {
                ...state,
                loading: false,
                purchase_request: action.payload,
            };
        default:
            console.warn("Unknown action type received:", action.type);
            return state;
    }
};

export { reducer, initials, actions };
