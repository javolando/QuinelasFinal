from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict

JornadaType = Literal["Quiniela", "Quinigol", "Both"]

# Para el Pleno al 15 se usan categorías de goles: 0, 1, 2 y M (3 o más)
GoalCat = Literal["0", "1", "2", "M"]

class MatchQuiniela(BaseModel):
    n: int = Field(ge=1, le=15)
    home: str
    away: str

class ResultQuiniela(BaseModel):
    """Resultado oficial o simulado de La Quiniela.

    - Partidos 1..14: result = 1 / X / 2
    - Pleno al 15 (n=15): homeCat/awayCat con 0/1/2/M
    """

    n: int = Field(ge=1, le=15)
    result: Optional[Literal["1", "X", "2"]] = None
    homeCat: Optional[GoalCat] = None
    awayCat: Optional[GoalCat] = None

class MatchQuinigol(BaseModel):
    n: int = Field(ge=1, le=6)
    home: str
    away: str

class ResultQuinigol(BaseModel):
    n: int = Field(ge=1, le=6)
    home_goals: int = Field(ge=0, le=9)
    away_goals: int = Field(ge=0, le=9)

class JornadaCreate(BaseModel):
    # Para jornadas creadas por el admin se permite usar un nombre libre.
    # number es opcional para soportar casos tipo "Copa del Rey + Premier".
    number: Optional[int] = Field(default=None, ge=1, le=99)
    name: Optional[str] = None
    season: str = Field(example="2025/2026")
    type: JornadaType
    isOfficial: bool = False
    matchesQuiniela: Optional[List[MatchQuiniela]] = None
    matchesQuinigol: Optional[List[MatchQuinigol]] = None

class JornadaOut(BaseModel):
    id: str
    number: Optional[int] = None
    name: Optional[str] = None
    season: str
    type: JornadaType
    createdBy: str
    isOfficial: bool
    matchesQuiniela: Optional[List[MatchQuiniela]] = None
    matchesQuinigol: Optional[List[MatchQuinigol]] = None
    resultsQuiniela: Optional[List[ResultQuiniela]] = None
    resultsQuinigol: Optional[List[ResultQuinigol]] = None
    prizeTableQuiniela: Optional[Dict[str, float]] = None
    prizeTableQuinigol: Optional[Dict[str, float]] = None

class JornadaResultsUpdate(BaseModel):
    resultsQuiniela: Optional[List[ResultQuiniela]] = None
    resultsQuinigol: Optional[List[ResultQuinigol]] = None
    prizeTableQuiniela: Optional[Dict[str, float]] = None
    prizeTableQuinigol: Optional[Dict[str, float]] = None
