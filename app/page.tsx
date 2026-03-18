//import styles from './styles.module.css'

                           
import CitySearch from "@/components/CitySearch";
import { getPopulatedCities } from "./utils/cityParser";
import Forecast from "./components/Forecast";

export default async function Page() {

/*
  const populatedCities = await getPopulatedCities();

  return <section>

    <h2>Select your city</h2>

    <CitySearch cities={populatedCities}></CitySearch>

    <h2>Saved Cities:</h2>

  </section>;
*/

return <Forecast></Forecast>
}
