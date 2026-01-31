from fastapi import FastAPI
from app.schemas.common.CP_SAT_request_schema import CPSATRequestSchema
from app.services.CP_SAT import HSU_AUTO_SCHEDULER_CP_SAT

app = FastAPI()


@app.post("/cp-sat")
def cp_sat(cp_sat_request: CPSATRequestSchema):
    filtered_data = cp_sat_request.filtered_data
    pre_selected_courses = cp_sat_request.pre_selected_courses
    constraints = cp_sat_request.constraints

    reseponse_data = HSU_AUTO_SCHEDULER_CP_SAT(
        filtered_data, pre_selected_courses, constraints
    )
    return reseponse_data
