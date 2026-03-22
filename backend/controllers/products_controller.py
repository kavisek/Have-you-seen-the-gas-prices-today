import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.db import Product
from models.schemas import ProductCreate, ProductOut

router = APIRouter()


@router.post("/products", response_model=ProductOut)
async def create_product(req: ProductCreate, db: Session = Depends(get_db)):
    p = Product(name=req.name, description=req.description)
    db.add(p)
    db.commit()
    db.refresh(p)
    return ProductOut(id=p.id, name=p.name, description=p.description)


@router.get("/products", response_model=list[ProductOut])
async def list_products(db: Session = Depends(get_db)):
    rows = db.query(Product).all()
    return [ProductOut(id=r.id, name=r.name, description=r.description) for r in rows]


@router.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, db: Session = Depends(get_db)):
    try:
        uid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    p = db.query(Product).filter(Product.id == uid).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return ProductOut(id=p.id, name=p.name, description=p.description)


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, db: Session = Depends(get_db)):
    try:
        uid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    p = db.query(Product).filter(Product.id == uid).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(p)
    db.commit()
    return {"ok": True}
