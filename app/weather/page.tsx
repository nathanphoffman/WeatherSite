import styles from './styles2.module.css'

export default async function Page() {
  
  const data = await fetch('http://localhost:3000/api/noaa')
  const weather = await data.json()

  const weatherDiv = Object.keys(weather.cached).map((key) => {

    const weatherByThreeHours = weather.cached[key].map(
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
