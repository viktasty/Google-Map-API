
import './App.css';
import InputForm from './components/InputForm';

const Client = () => {

  return (
    <>
      <InputForm />
    </>
  );
}
const App = () => {
  return (
    <div className="App">
    <h1 style={{padding:'30px'}}>We are now Testing.</h1>
      <h1 style={{padding:'30px'}}>Google Map Matrix Distance API Test</h1>
      <Client />


    </div>
  );
}

export default App;
