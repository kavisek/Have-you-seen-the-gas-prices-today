from controllers.hs_codes_controller import get_df


def search_hs_codes(query: str, limit: int = 10) -> list[dict]:
    try:
        df = get_df()
    except FileNotFoundError:
        return []

    if not query or not query.strip():
        page_data = df.head(limit)
        return page_data.to_dict(orient="records")

    q = query.strip()
    mask = df["tariff"].str.contains(q, case=False, na=False) | df[
        "description"
    ].str.contains(q, case=False, na=False)
    filtered = df[mask]
    return filtered.head(limit).to_dict(orient="records")


def get_hs_code(tariff: str) -> dict | None:
    try:
        df = get_df()
    except FileNotFoundError:
        return None

    exact = df[df["tariff"].str.strip() == tariff.strip()]
    if exact.empty:
        return None
    return exact.iloc[0].to_dict()
