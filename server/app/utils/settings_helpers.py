# server/app/utils/settings_helpers.py

from sqlalchemy.orm import Session
from ..models import models
from ..schemas import schemas

# --- YEH AAPKA CENTRAL TOOLBOX HAI ---

def get_low_stock_threshold(db: Session) -> int:
    """
    Database se 'LOW_STOCK_THRESHOLD' setting laata hai.
    """
    setting = db.query(models.AppSettings).filter(
        models.AppSettings.setting_key == "LOW_STOCK_THRESHOLD"
    ).first()
    if setting and setting.setting_value.isdigit():
        return int(setting.setting_value)
    return 10  # Default value 10

def get_product_status(stock_quantity: int, low_stock_threshold: int) -> schemas.StockStatus:
    """
    Stock aur threshold ke hisaab se product ka status batata hai.
    """
    if stock_quantity <= 0:
        return schemas.StockStatus.Out_of_Stock
    elif stock_quantity <= low_stock_threshold:
        return schemas.StockStatus.Low_Stock
    else:
        return schemas.StockStatus.In_Stock

def update_product_status_dynamically(product: models.Product, db: Session):
    """
    Product ka status DYNAMIC threshold ke hisaab se update karta hai.
    (Yeh aapke bulk.py se inspire hoke banaya gaya hai aur ab orders.py ka bug fix karega)
    """
    threshold = get_low_stock_threshold(db)
    
    if product.stock_quantity <= 0:
        product.stock_quantity = 0 # Ensure stock isn't negative
        product.status = models.StockStatus.Out_of_Stock
    elif product.stock_quantity <= threshold:
        product.status = models.StockStatus.Low_Stock
    else:
        product.status = models.StockStatus.In_Stock