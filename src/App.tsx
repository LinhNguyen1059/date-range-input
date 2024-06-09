import "./App.css";
// import { DateRangeInput } from "rsuite";
import "rsuite/DateRangeInput/styles/index.css";
import DateRangeInput from "./components/DateRangeInput";

function App() {
  return (
    <div className="App">
      <DateRangeInput
      // value={[new Date("2023-10-01"), new Date("2023-10-31")]}
      />
    </div>
  );
}

export default App;
