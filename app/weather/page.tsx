import styles from './styles.module.css'

export default async function Page() {
  
  const data = await fetch('http://localhost:3000/api/noaa')
  const weather = await data.json()
  console.log(weather);

  const weatherDiv = Object.keys(weather.cached).map((key) => {

    // @ts-ignore
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
