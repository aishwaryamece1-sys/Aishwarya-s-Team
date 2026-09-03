import { RealWeatherData, RealCurrentWeather, HourlyWeatherPoint, DailyWeatherPoint } from '../types';

export class WeatherService {
  /**
   * Decode standard WMO Weather Codes into clear descriptions
   */
  static decodeWeatherCode(code: number): { description: string; icon: string; severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' } {
    switch (code) {
      case 0:
        return { description: 'Clear sky', icon: 'Sun', severity: 'LOW' };
      case 1:
        return { description: 'Mainly clear', icon: 'SunMedium', severity: 'LOW' };
      case 2:
        return { description: 'Partly cloudy', icon: 'CloudSun', severity: 'LOW' };
      case 3:
        return { description: 'Overcast', icon: 'Cloud', severity: 'LOW' };
      case 45:
      case 48:
        return { description: 'Fog / Depositing rime fog', icon: 'CloudFog', severity: 'LOW' };
      case 51:
        return { description: 'Light drizzle', icon: 'CloudDrizzle', severity: 'LOW' };
      case 53:
        return { description: 'Moderate drizzle', icon: 'CloudDrizzle', severity: 'LOW' };
      case 55:
        return { description: 'Dense intensity drizzle', icon: 'CloudDrizzle', severity: 'MODERATE' };
      case 61:
        return { description: 'Slight rain', icon: 'CloudRain', severity: 'LOW' };
      case 63:
        return { description: 'Moderate rain', icon: 'CloudRain', severity: 'MODERATE' };
      case 65:
        return { description: 'Heavy continuous rain', icon: 'CloudRain', severity: 'HIGH' };
      case 80:
        return { description: 'Slight rain showers', icon: 'CloudRain', severity: 'LOW' };
      case 81:
        return { description: 'Moderate rain showers', icon: 'CloudRain', severity: 'MODERATE' };
      case 82:
        return { description: 'Violent cloudburst rain showers', icon: 'CloudLightning', severity: 'EXTREME' };
      case 95:
        return { description: 'Thunderstorm (Slight or Moderate)', icon: 'CloudLightning', severity: 'HIGH' };
      case 96:
      case 99:
        return { description: 'Severe Thunderstorm with Hail', icon: 'CloudLightning', severity: 'EXTREME' };
      default:
        return { description: 'Atmospheric precipitation', icon: 'CloudRain', severity: 'LOW' };
    }
  }

  /**
   * Fetch real live weather and forecast for any latitude & longitude
   */
  static async fetchRealWeather(
    lat: number,
    lng: number,
    locationName: string = 'Selected Location',
    regionName: string = '',
    countryName: string = ''
  ): Promise<RealWeatherData> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toFixed(4));
    url.searchParams.set('longitude', lng.toFixed(4));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m'
    );
    url.searchParams.set(
      'hourly',
      'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,weather_code,surface_pressure,wind_speed_10m'
    );
    url.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max'
    );
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '7');

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Weather API returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const curr = data.current || {};
    const hourly = data.hourly || {};
    const daily = data.daily || {};

    const currentWeatherCode = curr.weather_code ?? 0;
    const weatherInfo = this.decodeWeatherCode(currentWeatherCode);

    const current: RealCurrentWeather = {
      temperatureC: Math.round(curr.temperature_2m ?? 24),
      apparentTemperatureC: Math.round(curr.apparent_temperature ?? curr.temperature_2m ?? 24),
      relativeHumidityPct: Math.round(curr.relative_humidity_2m ?? 65),
      precipitationMm: Number((curr.precipitation ?? 0).toFixed(1)),
      rainMm: Number((curr.rain ?? 0).toFixed(1)),
      showersMm: Number((curr.showers ?? 0).toFixed(1)),
      weatherCode: currentWeatherCode,
      weatherDescription: weatherInfo.description,
      windSpeedKmh: Math.round(curr.wind_speed_10m ?? 12),
      windDirectionDeg: Math.round(curr.wind_direction_10m ?? 180),
      surfacePressureHpa: Math.round(curr.surface_pressure ?? 1013),
      isDay: curr.is_day === 1,
      timestamp: curr.time || new Date().toISOString(),
    };

    // Format hourly data (take 48 hours)
    const hourlyPoints: HourlyWeatherPoint[] = [];
    const hourlyTimes: string[] = hourly.time || [];
    const maxHours = Math.min(hourlyTimes.length, 48);

    for (let i = 0; i < maxHours; i++) {
      const t = hourlyTimes[i];
      const dateObj = new Date(t);
      const displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const wCode = hourly.weather_code?.[i] ?? 0;
      hourlyPoints.push({
        time: t,
        displayTime,
        temperatureC: Math.round(hourly.temperature_2m?.[i] ?? current.temperatureC),
        precipitationMm: Number((hourly.precipitation?.[i] ?? 0).toFixed(1)),
        rainMm: Number((hourly.rain?.[i] ?? 0).toFixed(1)),
        precipitationProbabilityPct: Math.round(hourly.precipitation_probability?.[i] ?? 0),
        humidityPct: Math.round(hourly.relative_humidity_2m?.[i] ?? 60),
        windSpeedKmh: Math.round(hourly.wind_speed_10m?.[i] ?? 10),
        surfacePressureHpa: Math.round(hourly.surface_pressure?.[i] ?? 1013),
        weatherCode: wCode,
        weatherDescription: this.decodeWeatherCode(wCode).description,
      });
    }

    // Format daily data (7 days)
    const dailyPoints: DailyWeatherPoint[] = [];
    const dailyDates: string[] = daily.time || [];

    for (let i = 0; i < dailyDates.length; i++) {
      const d = dailyDates[i];
      const dateObj = new Date(d);
      const displayDate = dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      const wCode = daily.weather_code?.[i] ?? 0;
      dailyPoints.push({
        date: d,
        displayDate,
        temperatureMaxC: Math.round(daily.temperature_2m_max?.[i] ?? 28),
        temperatureMinC: Math.round(daily.temperature_2m_min?.[i] ?? 20),
        precipitationSumMm: Number((daily.precipitation_sum?.[i] ?? 0).toFixed(1)),
        rainSumMm: Number((daily.rain_sum?.[i] ?? 0).toFixed(1)),
        precipitationProbabilityMaxPct: Math.round(daily.precipitation_probability_max?.[i] ?? 0),
        windSpeedMaxKmh: Math.round(daily.wind_speed_10m_max?.[i] ?? 15),
        weatherCode: wCode,
        weatherDescription: this.decodeWeatherCode(wCode).description,
      });
    }

    return {
      location: {
        name: locationName,
        region: regionName,
        country: countryName,
        lat,
        lng,
        elevationM: data.elevation,
        timezone: data.timezone || 'UTC',
      },
      current,
      hourly: hourlyPoints,
      daily: dailyPoints,
      retrievedAt: new Date().toISOString(),
      source: 'Open-Meteo High-Resolution Numerical Weather Model Ingest',
    };
  }
}
