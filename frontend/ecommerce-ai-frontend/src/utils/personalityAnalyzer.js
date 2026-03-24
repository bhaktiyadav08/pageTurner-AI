/* eslint-disable no-unused-vars */
class PersonalityAnalyzer {
  constructor() {
    this.profiles = {
      adventurous_explorer: {
        name: "The Adventurous Explorer",
        emoji: "🌍",
        description: "You love discovering new genres and authors. Variety is the spice of your reading life!",
        traits: ["Genre-hopper", "Curious", "Open-minded"],
        color: "#a78bfa",
        recommendations: "Try diverse genres, bestseller lists, and award winners"
      },
      focused_specialist: {
        name: "The Focused Specialist",
        emoji: "🎯",
        description: "You know what you like and stick to it. Deep dives into favorite genres are your thing.",
        traits: ["Loyal", "Discerning", "Genre-focused"],
        color: "#10b981",
        recommendations: "Explore series, similar authors, and genre deep-cuts"
      },
      bargain_hunter: {
        name: "The Budget-Conscious Reader",
        emoji: "💰",
        description: "You're smart with your money! Every dollar counts when building your library.",
        traits: ["Price-aware", "Value-seeker", "Patient"],
        color: "#f59e0b",
        recommendations: "Look for deals, bundles, and value collections"
      },
      quick_decider: {
        name: "The Decisive Reader",
        emoji: "⚡",
        description: "You know what you want, fast! Quick decisions and straight to cart.",
        traits: ["Efficient", "Confident", "Action-oriented"],
        color: "#ef4444",
        recommendations: "Show bestsellers first, skip lengthy descriptions"
      },
      thoughtful_researcher: {
        name: "The Thoughtful Researcher",
        emoji: "🔍",
        description: "You take your time, read reviews, compare options. Research is part of the fun!",
        traits: ["Analytical", "Thorough", "Detail-oriented"],
        color: "#06b6d4",
        recommendations: "Provide detailed info, comparisons, and reviews"
      },
      binge_reader: {
        name: "The Binge Reader",
        emoji: "📚",
        description: "One book? Never! You're building a collection and reading list simultaneously.",
        traits: ["Enthusiastic", "Committed", "Collection-builder"],
        color: "#ec4899",
        recommendations: "Suggest series, multi-book deals, and reading lists"
      },
      casual_browser: {
        name: "The Casual Browser",
        emoji: "🌙",
        description: "You're here for a good time, not a rushed time. Browsing is an experience to enjoy.",
        traits: ["Relaxed", "Exploratory", "Patient"],
        color: "#8b5cf6",
        recommendations: "Beautiful covers, engaging descriptions, no pressure"
      }
    };
  }

  analyzePersonality(features, events) {
    const scores = {
      adventurous_explorer: 0,
      focused_specialist: 0,
      bargain_hunter: 0,
      quick_decider: 0,
      thoughtful_researcher: 0,
      binge_reader: 0,
      casual_browser: 0
    };

    // Genre Diversity Analysis
    if (features.unique_genres_explored >= 4) {
      scores.adventurous_explorer += 30;
    } else if (features.unique_genres_explored <= 2) {
      scores.focused_specialist += 30;
    }

    if (features.genre_entropy > 2.0) {
      scores.adventurous_explorer += 20;
    } else if (features.genre_entropy < 1.0) {
      scores.focused_specialist += 20;
    }

    // Price Sensitivity
    if (features.price_sensitivity > 60) {
      scores.bargain_hunter += 40;
    }

    // Decision Speed
    if (features.time_to_first_cart < 60 && features.time_to_first_cart > 0) {
      scores.quick_decider += 35;
    } else if (features.time_to_first_cart > 180) {
      scores.thoughtful_researcher += 35;
    }

    // Engagement Level
    if (features.avg_hover_duration > 3000) {
      scores.thoughtful_researcher += 25;
    } else if (features.avg_hover_duration < 1500) {
      scores.quick_decider += 20;
    }

    // Cart Behavior
    if (features.books_added_to_cart >= 3) {
      scores.binge_reader += 40;
    } else if (features.books_added_to_cart === 0 && features.session_duration_seconds > 120) {
      scores.casual_browser += 30;
    }

    // Exploration Score
    if (features.exploration_score > 70) {
      scores.adventurous_explorer += 25;
      scores.casual_browser += 15;
    }

    // Session Duration
    if (features.session_duration_seconds > 300) {
      scores.thoughtful_researcher += 20;
      scores.casual_browser += 20;
    } else if (features.session_duration_seconds < 60) {
      scores.quick_decider += 15;
    }

    // View to Cart Ratio
    if (features.view_to_cart_ratio > 0.5) {
      scores.quick_decider += 20;
      scores.binge_reader += 15;
    }

    // Genre Switches
    if (features.genre_switches > 8) {
      scores.adventurous_explorer += 15;
    }

    // Find highest score
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primaryType = sortedScores[0][0];
    const primaryScore = sortedScores[0][1];
    const secondaryType = sortedScores[1][0];
    const secondaryScore = sortedScores[1][1];

    // Get profile data
    const primaryProfile = this.profiles[primaryType];
    const secondaryProfile = this.profiles[secondaryType];

    // Calculate confidence
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? Math.round((primaryScore / totalScore) * 100) : 50;

    return {
      primary: {
        type: primaryType,
        ...primaryProfile,
        score: primaryScore,
        confidence: confidence
      },
      secondary: secondaryScore > primaryScore * 0.6 ? {
        type: secondaryType,
        ...secondaryProfile,
        score: secondaryScore
      } : null,
      allScores: scores,
      insights: this.generateInsights(features, primaryType, secondaryType)
    };
  }

  generateInsights(features, primaryType, secondaryType) {
    const insights = [];

    // Genre insights
    if (features.unique_genres_explored >= 4) {
      insights.push({
        icon: "🎨",
        text: `You've explored ${features.unique_genres_explored} different genres - true variety seeker!`
      });
    } else if (features.unique_genres_explored <= 2) {
      insights.push({
        icon: "🎯",
        text: `You stick to ${features.unique_genres_explored} genres - you know what you love!`
      });
    }

    // Engagement insights
    if (features.avg_hover_duration > 3000) {
      insights.push({
        icon: "⏱️",
        text: `Average ${(features.avg_hover_duration / 1000).toFixed(1)}s per book - you take your time!`
      });
    }

    // Cart insights
    if (features.books_added_to_cart > 0) {
      insights.push({
        icon: "🛒",
        text: `${features.books_added_to_cart} books in cart - building your collection!`
      });
    }

    // Price insights
    if (features.price_sensitivity > 60) {
      insights.push({
        icon: "💵",
        text: "You're price-conscious - smart shopping!"
      });
    }

    // Exploration insights
    if (features.exploration_score > 70) {
      insights.push({
        icon: "🔭",
        text: "High exploration score - you love discovering new books!"
      });
    }

    return insights.slice(0, 4); // Return top 4 insights
  }

  getReadingArchetype(primaryType) {
    const archetypes = {
      adventurous_explorer: "Explorer",
      focused_specialist: "Specialist",
      bargain_hunter: "Optimizer",
      quick_decider: "Decider",
      thoughtful_researcher: "Analyst",
      binge_reader: "Collector",
      casual_browser: "Browser"
    };

    return archetypes[primaryType] || "Reader";
  }
}

const personalityAnalyzer = new PersonalityAnalyzer();
export default personalityAnalyzer;