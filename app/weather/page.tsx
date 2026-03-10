import styles from './styles.module.css'
import { getLat, getLon } from '../api/noaa/config'
import { getSavedLatLongForecast, saveLatLongForecast } from '../api/noaa/database'
import { runMe } from '../api/noaa/start'

export const dynamic = 'force-dynamic'

export default async function Page() {

  const record = await runMe();
  const weather = record.cached;
  const weatherDiv = Object.keys(weather).map((key) => {

    // @ts-ignore
    const weatherByThreeHours = weather[key].map(
      (threeHourEntry: string, i: number) => <div key={key + String(i)} dangerouslySetInnerHTML={{ __html: threeHourEntry }}></div>
    );

    return (<div className={styles.day} key={key}>
      <h2 className="text-xl">{key}</h2>
      {weatherByThreeHours}
    </div>
    );

  });
 
  return (<div className="wrapper">{weatherDiv}</div>);
  
}
