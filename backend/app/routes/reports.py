"""
BankSight AI — Reports & Academic Paper Download API Router
Provides executive audit reports and academic paper exports.
"""
from typing import Dict, Any
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse, FileResponse, Response

from backend.app.database import get_portfolio_df, get_scored_portfolio_df, get_model_artifacts
from src.report_generation import generate_executive_report_markdown, generate_research_paper_text
from src.analytics import compute_portfolio_kpis
from src.config import BASE_DIR

router = APIRouter(prefix="/reports", tags=["Reports & Documentation"])


@router.get("/executive")
def get_executive_report():
    df = get_portfolio_df()
    kpis = compute_portfolio_kpis(df)
    text = generate_executive_report_markdown(kpis)
    return PlainTextResponse(content=text, media_type="text/markdown")


@router.get("/paper")
def get_academic_paper():
    df = get_portfolio_df()
    artifacts = get_model_artifacts()
    kpis = compute_portfolio_kpis(df)
    cv_res = artifacts.get("cv_results", artifacts.get("test_evaluations", {}))
    best_name = artifacts.get("best_model_name", "Calibrated Gradient Boosting")
    text = generate_research_paper_text(kpis, cv_res, best_name)
    return PlainTextResponse(content=text, media_type="text/markdown")



@router.get("/download-paper")
def download_paper_docx():
    paper_path = BASE_DIR / "BankSight_AI_Research_Paper.docx"
    if paper_path.exists():
        return FileResponse(
            path=paper_path,
            filename="BankSight_AI_Research_Paper.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    return PlainTextResponse("BankSight AI Research paper docx not found.", status_code=404)


@router.get("/government-summary")
def get_government_summary():
    summary_path = BASE_DIR / "reports" / "Executive_Summary_Government_Stakeholders.md"
    if summary_path.exists():
        return PlainTextResponse(content=summary_path.read_text(encoding="utf-8"), media_type="text/markdown")
    return PlainTextResponse(content="Government executive summary available in reports/.", media_type="text/plain")


@router.get("/download-government-summary")
def download_government_summary_docx():
    summary_path = BASE_DIR / "reports" / "Executive_Summary_Government_Stakeholders.docx"
    if summary_path.exists():
        return FileResponse(
            path=summary_path,
            filename="Executive_Summary_Government_Stakeholders.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    return get_government_summary()


@router.get("/download-pdf-dossier")
@router.get("/download-pdf")
def download_executive_pdf_dossier():
    """Generates and serves the publication-grade BankSight AI Executive Dossier in PDF format."""
    from src.pdf_generator import build_executive_pdf_dossier
    pdf_path = BASE_DIR / "reports" / "BankSight_AI_Executive_Dossier.pdf"
    if not pdf_path.exists():
        build_executive_pdf_dossier(str(pdf_path))
    return FileResponse(
        path=pdf_path,
        filename="BankSight_AI_Executive_Dossier.pdf",
        media_type="application/pdf",
    )

