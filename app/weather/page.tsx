import styles from './styles.module.css'
import { getForecast } from '../api/noaa/storage/main'

export const dynamic = 'force-dynamic'

export default async function Page() {

  const weather = await getForecast();
  //const weather = JSON.parse(weatherStr);
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
