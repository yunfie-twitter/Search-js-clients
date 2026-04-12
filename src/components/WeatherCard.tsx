import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, Typography, Skeleton, IconButton, Alert } from '@mui/material';
import {
  WbSunnyOutlined,
  CloudOutlined,
  CloudQueueOutlined,
  WaterDropOutlined,
  AcUnitOutlined,
  ThunderstormOutlined,
  LocationOnOutlined,
  RefreshOutlined,
  ErrorOutlineOutlined,
} from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';

interface WeatherData {
  city: string;
  temp: number;
  precip: number;
  wind: number;
  code: number;
}

const getWeatherDetails = (code: number, lang: 'ja' | 'en') => {
  if (code === 0) {
    return { text: lang === 'ja' ? '快晴' : 'Clear', Icon: WbSunnyOutlined, color: '#ff9800' };
  } else if (code >= 1 && code <= 3) {
    return { text: lang === 'ja' ? '曇り' : 'Cloudy', Icon: CloudQueueOutlined, color: '#9e9e9e' };
  } else if (code === 45 || code === 48) {
    return { text: lang === 'ja' ? '霧' : 'Fog', Icon: CloudOutlined, color: '#9e9e9e' };
  } else if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { text: lang === 'ja' ? '雨' : 'Rain', Icon: WaterDropOutlined, color: '#2196f3' };
  } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { text: lang === 'ja' ? '雪' : 'Snow', Icon: AcUnitOutlined, color: '#00bcd4' };
  } else if (code >= 95 && code <= 99) {
    return { text: lang === 'ja' ? '雷雨' : 'Thunderstorm', Icon: ThunderstormOutlined, color: '#673ab7' };
  }
  return { text: lang === 'ja' ? '不明' : 'Unknown', Icon: CloudOutlined, color: '#9e9e9e' };
};

const WeatherCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            maximumAge: 300_000, // 5 minutes cache
            timeout: 10000,
          });
        }
      });

      const { latitude: lat, longitude: lon } = position.coords;

      const [geoRes, weatherRes] = await Promise.all([
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${language}`),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`)
      ]);

      if (!geoRes.ok || !weatherRes.ok) {
        throw new Error('Failed to fetch API data');
      }

      const geoData = await geoRes.json();
      const weatherData = await weatherRes.json();

      const city = geoData.locality || geoData.city || geoData.principalSubdivision || (language === 'ja' ? '現在地' : 'Current Location');
      const current = weatherData.current;

      setData({
        city,
        temp: current.temperature_2m,
        precip: current.precipitation,
        wind: current.wind_speed_10m,
        code: current.weather_code,
      });
    } catch (err: any) {
      if (err instanceof GeolocationPositionError) {
        setError(language === 'ja' ? '位置情報の取得が拒否されたか、失敗しました。' : 'Location access denied or failed.');
      } else {
        setError(language === 'ja' ? '天気情報の取得に失敗しました。' : 'Failed to fetch weather data.');
      }
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnOutlined color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            {loading ? <Skeleton width={100} /> : (data?.city || (language === 'ja' ? '現在地' : 'Current Location'))}
          </Typography>
        </Box>
        <IconButton size="small" onClick={fetchWeather} disabled={loading}>
          <RefreshOutlined fontSize="small" />
        </IconButton>
      </Box>

      {error ? (
        <Alert severity="error" icon={<ErrorOutlineOutlined />} sx={{ mt: 1, borderRadius: '12px', fontSize: '13px' }}>
          {error}
        </Alert>
      ) : loading || !data ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box>
              <Skeleton width={80} height={32} />
              <Skeleton width={120} height={20} />
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', backgroundColor: `${getWeatherDetails(data.code, language).color}20` }}>
            {React.createElement(getWeatherDetails(data.code, language).Icon, { sx: { color: getWeatherDetails(data.code, language).color, fontSize: 28 } })}
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
                {Math.round(data.temp)}°C
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {getWeatherDetails(data.code, language).text}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <span>{language === 'ja' ? `降水量: ${data.precip}mm` : `Precip: ${data.precip}mm`}</span>
              <span>&bull;</span>
              <span>{language === 'ja' ? `風速: ${data.wind}m/s` : `Wind: ${data.wind}m/s`}</span>
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default WeatherCard;
