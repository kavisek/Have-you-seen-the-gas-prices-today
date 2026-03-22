import io
import uuid
import zipfile
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from database import get_db
from models.db import Document, Product
from services.doc_generator import generate_binding_ruling, generate_coo

router = APIRouter()


@router.post("/documents/coo")
async def post_coo(body: dict[str, Any], db: Session = Depends(get_db)):
    pdf = generate_coo(body)
    pid = body.get("product_id")
    if pid:
        try:
            uid = uuid.UUID(str(pid))
            p = db.query(Product).filter(Product.id == uid).first()
            if p:
                db.add(Document(product_id=uid, doc_type="coo", file_path=None))
                db.commit()
        except ValueError:
            pass
    return Response(content=pdf, media_type="application/pdf")


@router.post("/documents/binding-ruling")
async def post_binding(body: dict[str, Any], db: Session = Depends(get_db)):
    pdf = generate_binding_ruling(body)
    pid = body.get("product_id")
    if pid:
        try:
            uid = uuid.UUID(str(pid))
            p = db.query(Product).filter(Product.id == uid).first()
            if p:
                db.add(Document(product_id=uid, doc_type="binding_ruling", file_path=None))
                db.commit()
        except ValueError:
            pass
    return Response(content=pdf, media_type="application/pdf")


@router.get("/documents/{product_id}/package")
async def get_package(product_id: str, db: Session = Depends(get_db)):
    try:
        uid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    prod = db.query(Product).filter(Product.id == uid).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    docs = db.query(Document).filter(Document.product_id == uid).all()
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, d in enumerate(docs):
            zf.writestr(f"{d.doc_type}_{i}.txt", f"doc_id={d.id}\n")
    return Response(
        content=buf.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=product_{product_id}.zip"},
    )
