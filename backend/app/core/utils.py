from bson import ObjectId

def oid(x: str) -> ObjectId:
    return ObjectId(x)

def oid_str(x) -> str:
    return str(x)

def clean_mongo(doc: dict) -> dict:
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc
