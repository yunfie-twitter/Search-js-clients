import { lazy } from 'react';

// Use lazy loading for cards to keep main bundle small
export const cardRegistry = {
  weather: {
    id: 'weather',
    component: lazy(() => import('../WeatherCard')), // Existing WeatherCard
    defaultSize: 'medium' as 'small' | 'medium' | 'large',
  },
  rss: {
    id: 'rss',
    component: lazy(() => import('./RssCard')),
    defaultSize: 'medium' as 'small' | 'medium' | 'large',
  },
  qr: {
    id: 'qr',
    component: lazy(() => import('./QrCard')),
    defaultSize: 'small' as 'small' | 'medium' | 'large',
  },
  worldClock: {
    id: 'worldClock',
    component: lazy(() => import('./WorldClockCard')),
    defaultSize: 'medium' as 'small' | 'medium' | 'large',
  },
  querySuggest: {
    id: 'querySuggest',
    component: lazy(() => import('./QuerySuggestCard')),
    defaultSize: 'medium' as 'small' | 'medium' | 'large',
  },
  topicFollow: {
    id: 'topicFollow',
    component: lazy(() => import('./TopicFollowCard')),
    defaultSize: 'medium' as 'small' | 'medium' | 'large',
  },
  trending: {
    id: 'trending',
    component: lazy(() => import('./TrendingCard')),
    defaultSize: 'medium' as 'small' | 'medium' | 'large',
  },
  features: {
    id: 'features',
    component: lazy(() => import('./FeaturesCard')),
    defaultSize: 'medium' as 'small' | 'medium' | 'large',
  },
  anime: {
    id: 'anime',
    component: lazy(() => import('./AnimeCard')),
    defaultSize: 'medium' as 'small' | 'medium' | 'large',
  },
  currency: {
    id: 'currency',
    component: lazy(() => import('./CurrencyCard')),
    defaultSize: 'small' as 'small' | 'medium' | 'large',
  },
  aiTopic: {
    id: 'aiTopic',
    component: lazy(() => import('./AiTopicCard')),
    defaultSize: 'medium' as 'small' | 'medium' | 'large',
  },
  qrGenerator: {
    id: 'qrGenerator',
    component: lazy(() => import('./QrGeneratorCard')),
    defaultSize: 'small' as 'small' | 'medium' | 'large',
  }
};