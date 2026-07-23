"""
Moteur du chatbot Camping Mimosas — FAQ officielle + base de données.
Gemini : reformulation du small talk uniquement (jamais de faits inventés).
"""

import json
import os
import re
import unicodedata
from functools import lru_cache
from typing import Any, Optional

FAQ_PATH = os.path.join(os.path.dirname(__file__), 'data', 'camping_faq.json')

# Reformulation Gemini autorisée uniquement pour ces entrées
SMALL_TALK_IDS = {'greeting', 'thanks', 'goodbye'}


def _normalize(text: str) -> str:
    """Minuscules, sans accents, pour la recherche par mots-clés."""
    if not text:
        return ''
    text = text.lower().strip()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    return text


@lru_cache(maxsize=1)
def load_faq() -> dict:
    with open(FAQ_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def _format_reply(template: str, faq: dict) -> str:
    contact = faq.get('contact', {})
    mapping = {
        'phone': contact.get('phone', ''),
        'email': contact.get('email', ''),
        'address': contact.get('address', ''),
        'reception_hours': contact.get('reception_hours', ''),
        'restaurant_hours': contact.get('restaurant_hours', ''),
        'check_in': contact.get('check_in', ''),
        'check_out': contact.get('check_out', ''),
    }
    try:
        return template.format(**mapping)
    except KeyError:
        return template


def build_accommodations_reply(accommodation_model, ensure_default_fn=None) -> str:
    """Construit la réponse tarifs/hébergements depuis PostgreSQL."""
    faq = load_faq()
    try:
        if ensure_default_fn:
            ensure_default_fn()
        rows = accommodation_model.query.filter_by(is_available=True).order_by(
            accommodation_model.id.asc()
        ).all()
        if not rows:
            return faq.get('database_fallback_accommodations', '')

        lines = ["🏕️ **Hébergements Camping Mimosas** (tarifs / nuit)\n"]
        for acc in rows:
            price = acc.price_per_night
            price_txt = f"{int(price)} MAD" if price else "sur demande"
            cap = f" — jusqu'à {acc.capacity} pers." if acc.capacity else ""
            desc = (acc.description or '').strip()
            extra = f"\n   _{desc}_" if desc else ""
            lines.append(f"• **{acc.name}** : {price_txt}{cap}{extra}")

        links = faq.get('links', {})
        lines.append(f"\n➡️ Contactez notre équipe : {links.get('about', '/about')}")
        lines.append(f"➡️ Plus de détails : {links.get('services', '/services')}")
        return '\n'.join(lines)
    except Exception:
        return faq.get('database_fallback_accommodations', '')


def _match_entry(normalized_message: str, faq: dict) -> Optional[dict]:
    best = None
    best_score = 0
    for entry in faq.get('entries', []):
        score = 0
        for kw in entry.get('keywords', []):
            nkw = _normalize(kw)
            if not nkw:
                continue
            if nkw in normalized_message:
                score += len(nkw) + (2 if ' ' in nkw else 0)
        if score > best_score:
            best_score = score
            best = entry
    return best if best_score > 0 else None


def _reformulate_small_talk(official_reply: str, user_message: str, model) -> str:
    """Gemini reformule sans ajouter de faits (small talk uniquement)."""
    if not model:
        return official_reply
    try:
        prompt = (
            "Tu es Mimos, mascotte amicale du Camping Mimosas. "
            "Reformule UNIQUEMENT le message officiel ci-dessous en français, "
            "ton chaleureux, 1 à 3 phrases max, emojis légers. "
            "N'ajoute AUCUNE information factuelle (prix, horaires, adresse, services).\n\n"
            f"Message officiel : {official_reply}\n\n"
            f"Visiteur a dit : {user_message}\n\n"
            "Réponse reformulée :"
        )
        response = model.generate_content(prompt)
        text = (response.text or '').strip()
        return text if len(text) > 10 else official_reply
    except Exception:
        return official_reply


def process_chatbot_message(
    user_message: str,
    accommodation_model,
    ensure_default_accommodations_fn=None,
    gemini_model=None,
    allow_gemini_reformulation: bool = True,
) -> dict:
    """
    Traite un message et retourne { reply, source, matched_id }.
    source: faq | database | small_talk | fallback
    """
    raw = (user_message or '').strip()
    if not raw:
        return {'reply': None, 'error': 'Message vide', 'status': 'error'}

    faq = load_faq()
    normalized = _normalize(raw)
    entry = _match_entry(normalized, faq)

    if entry:
        entry_id = entry.get('id', '')
        source = entry.get('source')

        if source == 'database_accommodations':
            reply = build_accommodations_reply(
                accommodation_model,
                ensure_default_accommodations_fn,
            )
            return {
                'reply': reply,
                'source': 'database',
                'matched_id': entry_id,
                'status': 'success',
            }

        template = entry.get('reply')
        if template:
            reply = _format_reply(template, faq)
            if (
                allow_gemini_reformulation
                and gemini_model
                and entry.get('small_talk')
                and entry_id in SMALL_TALK_IDS
            ):
                reply = _reformulate_small_talk(reply, raw, gemini_model)
                return {
                    'reply': reply,
                    'source': 'small_talk',
                    'matched_id': entry_id,
                    'status': 'success',
                }
            return {
                'reply': reply,
                'source': 'faq',
                'matched_id': entry_id,
                'status': 'success',
            }

    fallback = _format_reply(faq.get('fallback', ''), faq)
    return {
        'reply': fallback,
        'source': 'fallback',
        'matched_id': None,
        'status': 'success',
    }
