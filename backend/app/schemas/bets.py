from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict

# 0,1,2 o M (3+)
GoalCat = Literal["0", "1", "2", "M"]

BetType = Literal["Quiniela", "Quinigol"]

class QuinielaSelection(BaseModel):
    """Selección del usuario en La Quiniela.

    - Partidos 1..14: picks = [1|X|2] (1 a 3 opciones)
    - Pleno al 15 (n=15): homeCat/awayCat con 0/1/2/M
    """

    n: int = Field(ge=1, le=15)
    picks: Optional[List[Literal["1", "X", "2"]]] = None
    homeCat: Optional[GoalCat] = None
    awayCat: Optional[GoalCat] = None

class QuinigolSelection(BaseModel):
    n: int = Field(ge=1, le=6)
    home_goals: int = Field(ge=0, le=9)
    away_goals: int = Field(ge=0, le=9)

class BetCreate(BaseModel):
    jornadaId: str
    type: BetType
    selectionsQuiniela: Optional[List[QuinielaSelection]] = None
    selectionsQuinigol: Optional[List[QuinigolSelection]] = None
    basePriceEuro: Optional[float] = 0.75  # configurable en frontend
    fixedPriceQuinigolEuro: Optional[float] = 1.0

class BetOverrideResults(BaseModel):
    # solo para simulación del usuario cuando no hay resultados oficiales
    resultsQuiniela: Optional[List[Dict]] = None
    resultsQuinigol: Optional[List[Dict]] = None

class BetOut(BaseModel):
    id: str
    userId: str
    jornadaId: str
    type: BetType
    createdAt: str
    costEuro: float
    hits: int
    prizeEuro: float
    netBalanceEuro: float
    status: Literal["pending", "calculated"]
    selectionsQuiniela: Optional[List[QuinielaSelection]] = None
    selectionsQuinigol: Optional[List[QuinigolSelection]] = None
    overrideResults: Optional[Dict] = None
