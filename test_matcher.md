
from typing import Dict, List, Any

# Initial weights — these are design assumptions, not research-validated weights.
WEIGHTS = {
    "research_interests": 0.25,
    "technical_skills": 0.20,
    "developmental_needs": 0.15,
    "career_goals": 0.15,
    "education": 0.10,
    "mentorship_style": 0.10,
    "availability": 0.05
}


def overlap_score(mentee_items, mentor_items):
    """Calculate overlap between two lists."""
    mentee_items = {x.lower() for x in mentee_items}
    mentor_items = {x.lower() for x in mentor_items}

    if not mentee_items or not mentor_items:
        return None

    return len(mentee_items & mentor_items) / len(mentee_items | mentor_items)


def coverage_score(mentee_needs, mentor_skills):
    """Measure how well a mentor's skills cover a mentee's development needs."""
    needs = {x.lower() for x in mentee_needs}
    skills = {x.lower() for x in mentor_skills}

    if not needs:
        return None

    return len(needs & skills) / len(needs)


def calculate_professional_match(mentee, mentor):
    """Calculate professional compatibility without demographic attributes."""

    scores = {
        "research_interests": overlap_score(
            mentee.get("research_interests", []),
            mentor.get("research_interests", [])
        ),
        "technical_skills": overlap_score(
            mentee.get("technical_skills", []),
            mentor.get("technical_skills", [])
        ),
        "developmental_needs": coverage_score(
            mentee.get("developmental_needs", []),
            mentor.get("technical_skills", [])
        ),
        "career_goals": overlap_score(
            mentee.get("career_goals", []),
            mentor.get("career_goals", [])
        ),
        "education": (
            1.0 if mentee.get("education_level")
            and mentee.get("education_level") == mentor.get("education_level")
            else 0.0
        ),
        "mentorship_style": overlap_score(
            mentee.get("preferred_mentorship_style", []),
            mentor.get("mentorship_style", [])
        ),
        "availability": overlap_score(
            mentee.get("availability", []),
            mentor.get("availability", [])
        )
    }

    available_weight = sum(
        WEIGHTS[key] for key, value in scores.items()
        if value is not None
    )

    if available_weight == 0:
        return 0.0, scores

    total_score = sum(
        WEIGHTS[key] * value
        for key, value in scores.items()
        if value is not None
    )

    normalized_score = total_score / available_weight

    return round(normalized_score * 100, 2), scores


def calculate_identity_affinity(mentee, mentor):
    """
    Optional identity-affinity discovery.
    This is separate from professional compatibility.
    Both parties must opt in.
    """

    preferences = mentee.get("affinity_preferences", {})

    if not preferences.get("enabled", False):
        return None

    if not mentor.get("affinity_opt_in", False):
        return None

    selected_attributes = preferences.get("attributes", [])

    if not selected_attributes:
        return None

    matches = {}

    for attribute in selected_attributes:
        mentee_value = mentee.get(attribute)
        mentor_value = mentor.get(attribute)

        if mentee_value is not None and mentor_value is not None:
            matches[attribute] = mentee_value == mentor_value

    if not matches:
        return None

    return {
        "attributes": matches,
        "matched": all(matches.values())
    }


def recommend_mentors(mentee, mentors, top_n=5):
    """Return ranked professional matches and separate affinity information."""

    recommendations = []

    for mentor in mentors:
        professional_score, breakdown = calculate_professional_match(
            mentee, mentor
        )

        affinity = calculate_identity_affinity(mentee, mentor)

        recommendations.append({
            "mentor_id": mentor["mentor_id"],
            "mentor_name": mentor["name"],
            "professional_score": professional_score,
            "score_breakdown": breakdown,
            "identity_affinity": affinity
        })

    recommendations.sort(
        key=lambda x: x["professional_score"],
        reverse=True
    )

    return recommendations[:top_n]


# -------------------------
# EXAMPLE DATA
# -------------------------

mentee = {
    "research_interests": ["quantum computing", "machine learning"],
    "technical_skills": ["Python", "statistics"],
    "developmental_needs": ["quantum algorithms", "research writing"],
    "career_goals": ["PhD", "quantum research"],
    "education_level": "Masters",
    "preferred_mentorship_style": ["structured", "collaborative"],
    "availability": ["Monday", "Wednesday"],

    # Optional identity information, voluntarily provided
    "race_ethnicity": "Black",
    "gender": "Woman",
    "affinity_preferences": {
        "enabled": True,
        "attributes": ["race_ethnicity", "gender"]
    }
}

mentors = [
    {
        "mentor_id": 1,
        "name": "Mentor A",
        "research_interests": ["quantum computing", "quantum algorithms"],
        "technical_skills": ["Python", "quantum algorithms", "research writing"],
        "career_goals": ["PhD", "quantum research"],
        "education_level": "PhD",
        "mentorship_style": ["structured", "collaborative"],
        "availability": ["Monday", "Wednesday"],
        "race_ethnicity": "Black",
        "gender": "Woman",
        "affinity_opt_in": True
    },
    {
        "mentor_id": 2,
        "name": "Mentor B",
        "research_interests": ["machine learning", "artificial intelligence"],
        "technical_skills": ["Python", "statistics", "machine learning"],
        "career_goals": ["industry research"],
        "education_level": "PhD",
        "mentorship_style": ["independent"],
        "availability": ["Tuesday", "Thursday"],
        "affinity_opt_in": False
    }
]


if __name__ == "__main__":
    results = recommend_mentors(mentee, mentors)

    for rank, result in enumerate(results, start=1):
        print(f"\nRank: {rank}")
        print(f"Mentor: {result['mentor_name']}")
        print(f"Professional Match: {result['professional_score']}%")
        print(f"Score Breakdown: {result['score_breakdown']}")
        print(f"Identity Affinity: {result['identity_affinity']}")

