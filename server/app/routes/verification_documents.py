from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.constants.roles import RESTAURANT, RIDER
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.verification_document import VerificationDocument
from app.schemas.verification_schema import VerificationDocumentResponse
from app.services.storage_service import save_document_upload


router = APIRouter(prefix="/verification-documents", tags=["Verification Documents"])


@router.post("", response_model=VerificationDocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_verification_document(
    role: str = Form(...),
    document_type: str = Form(...),
    business_name: str | None = Form(default=None),
    certificate_number: str | None = Form(default=None),
    tax_id: str | None = Form(default=None),
    business_address: str | None = Form(default=None),
    service_area: str | None = Form(default=None),
    vehicle_type: str | None = Form(default=None),
    vehicle_plate_number: str | None = Form(default=None),
    license_number: str | None = Form(default=None),
    national_id_number: str | None = Form(default=None),
    notes: str | None = Form(default=None),
    document: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if role != current_user.role:
        raise HTTPException(status_code=403, detail="Verification role must match the logged in user")
    if role not in {RESTAURANT, RIDER}:
        raise HTTPException(status_code=400, detail="Verification documents are required only for restaurants and riders")

    if role == RESTAURANT and not business_name:
        raise HTTPException(status_code=400, detail="Restaurant verification requires a business name")
    if role == RIDER and (not vehicle_type or not license_number or not national_id_number):
        raise HTTPException(status_code=400, detail="Rider verification requires vehicle type, licence number, and national ID")

    document_record = VerificationDocument(
        user_id=current_user.id,
        role=role,
        document_type=document_type,
        document_url="/pending-upload",
        business_name=business_name,
        certificate_number=certificate_number,
        tax_id=tax_id,
        business_address=business_address,
        service_area=service_area,
        vehicle_type=vehicle_type,
        vehicle_plate_number=vehicle_plate_number,
        license_number=license_number,
        national_id_number=national_id_number,
        notes=notes,
    )
    db.add(document_record)
    db.flush()
    document_record.document_url = await save_document_upload(document, "verification-documents", document_record.id)
    db.commit()
    db.refresh(document_record)
    return document_record


@router.get("/me", response_model=list[VerificationDocumentResponse])
def list_my_verification_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(VerificationDocument)
        .filter(VerificationDocument.user_id == current_user.id)
        .order_by(VerificationDocument.created_at.desc())
        .all()
    )
