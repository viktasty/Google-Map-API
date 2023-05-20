import { useState, useContext } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import excelLog from "../../excel.png";
import { Form, Button, FormControl, InputGroup, FaCheck, Row, Col, Table, Toast } from 'react-bootstrap';
import StatesContext from './StatesContext';
import { FaClipboard, FaCross, FaTimes } from 'react-icons/fa';
import { BsCheck } from 'react-icons/bs';
const OutputURL = () => {






// Replace this with your own goo.gl short URL
// const shortUrl = 'https://goo.gl/maps/L3T9CjYWmB3xjR9m7';

// // Make a request to the Google API to expand the short URL
// axios.get(`https://www.googleapis.com/urlshortener/v1/url?shortUrl=${shortUrl}`)
//   .then(response => {
//     // Extract the long URL from the response data
//     const longUrl = response.data.longUrl;

//     // Extract the latitude, longitude, and zoom level using a regular expression
//     const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),(\d+)z/;
//     const match = longUrl.match(regex);

//     if (match) {
//       const [_, lat, lng, zoom] = match;

//       console.log('Latitude:', lat);
//       console.log('Longitude:', lng);
//       console.log('Zoom Level:', zoom);
//     } else {
//       console.error('Invalid Google Maps URL');
//     }
//   })
//   .catch(error => {
//     console.error('Error expanding short URL:', error);
//   });










const [show, setShow] = useState(false);

  
  const [states, setStates] = useContext(StatesContext);
  const [highlighted, setHighlighted] = useState(false);
  const handleUpload = (file) => {
    // Use the FileReader API to read the contents of the file
    const reader = new FileReader();
    reader.onload = (evt) => {
      const binaryString = evt.target.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });

      // Get the name of the first sheet in the workbook
      const sheetName = workbook.SheetNames[0];

      // Use XLSX.utils.sheet_to_json() to convert the worksheet into an array of objects
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const uploadData=data.map(el=>({
        formBasicID:el.ID,
        formBasicName:el.Name,
        formBasicLatitude:el.Latitude,
        formBasicLongitude:el.Longitude,
        formBasicAddress:el.Address,
        phoneNumber:el['Phone Number'],
        shoutURL:el['Short URL'],
      }));
      setStates(pre=>({...pre,clients:uploadData}));
      console.log(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];

    setHighlighted(false);
    handleUpload(selectedFile);
  };
  const showToast=()=>setStates(pre=>({...pre,toastErr:true}));
  const handleGenURL=()=>{

    const postData=states.routeClients.map(elem=>{
      const {formBasicID,formBasicName,formBasicLatitude,formBasicLongitude,formBasicAddress} = elem.elem;
      return {id:formBasicID,name:formBasicName,lat:formBasicLatitude,lng:formBasicLongitude,adr:formBasicAddress};
    })
    axios.post('https://map.arbgg.com/postdata',{ data: postData },)
      .then(res => {console.log(res.data)
        const cb = () => {
          axios.get(`https://map.arbgg.com/geturl?fname=${res.data}`)
          .then(res => {console.log(res)
            if(res.data.status==="ok")setStates(pre=>({...pre,url:res.data.data}));
            else setTimeout(cb, 2000);
          }).catch(err=>console.log(err));showToast();
        };
        cb();
      })
      .catch(error => {
        console.log(error);showToast();
      });
  }
  const Copied=(props)=>(states.copied?(<Button onClick={()=>{
    window.open(states.url,'_blank');
  }} style={props.style}><BsCheck/></Button>):(<FaTimes style={props.style}/>));
  const copyToClipboard=(text) =>{
    navigator.clipboard.writeText(text)
      .then(() => {
        setStates(pre=>({...pre,copied:true}));
      })
      .catch((error) => {
        console.error('Could not copy text: ', error);
      });
  }
  return (
    <>

      <Row>
        <Col sm={2} />
        <Col sm={9}>
        <Toast show={states.toastErr} onClose={() => setStates(pre=>({...pre,toastErr:false}))} className="alert custom-toast" delay={3000} autohide animation>
        <Toast.Header>
          <strong className="mr-auto">Try again!</strong>
        </Toast.Header>
        <Toast.Body>
          Error occured. Please try again later.
        </Toast.Body>
      </Toast>

          <div onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setHighlighted(true); }}
            onDragLeave={() => setHighlighted(false)}
            style={{ width: "100%", height: "100px", padding: '30px', zIndex: 1000, border: "5px dotted black", backgroundColor: highlighted ? 'grey' : 'white' }}>
            <p style={{ zIndex: 2000 }}>Drag &amp; Drop Excel File Here</p></div>
          <div style={{ height: '110px', boxSizing: 'border-box' }}>
            <div className='dwExcel' style={{ margin: '5px' }}>
              Don't you know how to edit excel?<br /><a href="/sample.xlsx">Download sample excel file here...<br /><img style={{ verticalAlign: 'middle',width:'50px' }} src={excelLog} /></a>
            </div></div>
        </Col>
      </Row>
      <div style={{
        border: '2px solid #aaa',
        borderRadius: '10px',
        boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
        padding: '10px',
        height: '250px'
      }}>
        <h4>Output URL</h4>
        <Button onClick={handleGenURL} variant='danger' style={{
          boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
          width: '100%'
        }}>Generate URL</Button>
        <h6>URL<FaClipboard onClick={()=>{
          if(states.url!="url:")copyToClipboard(states.url);
        } }style={{color:'green',cursor:'pointer'}}/> <Copied style={{float:'right'}} /></h6>
        <div style={{height:'100px',backgroundColor:'black'}}>
        <code>{states.url}</code>
        </div>
      </div>
    </>
  )
}
export default OutputURL;