import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import axios from 'axios';
import { LinearProgress } from '@mui/material';

function App() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isOpen,setisOpen] = useState(false);
  const [successMessage,setSuccessMessage] = useState(null);
  
  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleCompanyChange = (event) => {
    setCompany(event.target.value);
  };
  const refreshPage = () => {
    window.location.reload(false);
  };
  const handleFileDrop = (acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
    // const files = this.state.files.map(file => (
    //     <li key={file.name}>
    //       {file.name} - {file.size} bytes
    //     </li>
    //   ));
    setFile(acceptedFiles.map(file => (
        <li key={file.name}>
          {file.name} - {Math.round(file.size / 1000)/1000} MB uploaded
        </li>
      )));
    // onDrop: acceptedFiles => {
    //     setFiles(acceptedFiles.map(file => Object.assign(file, {
    //       preview: URL.createObjectURL(file)
    //     })));
    //   }
  };
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log("Form submit triggered");    
    console.log("Requesting token");
    let token = "";
    await axios.get("https://gcp-pricing-helper-guide.uc.r.appspot.com/token", {
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
      }).then(response => {
        // The response data is a JSON object
        token = response.data;
        console.log("Token is: " + response.data);
      })
      .catch(error => {
        // The request failed
        console.log(error);
      });
    // const token = "ya29.a0AfB_byBQK3JnshqfDi6Y7Qlwllw55u-t6IWAbl55qSDzDPpECF3QSMvJq6EBUeE9WIuXGPrOUZDqajxLyCrzQLpNW-vLhfePLd-GmeqJSv2C9DADHZ4NLWBawwql_6bAT08YPxlsn0NhFku9eU8uwpzFf5EE9fRWqOpcsj3FvRoUOc47VCz125HFPzuVTcVYArKgnDpa3eV-fLpEG7pS--AnvhWym7C2DHsg0WfQ_huIayu1syPS-27kXX7qAIqJZIW_gwqinggukApYjP94zAhm_2AE9TteCtBT9Hd6BFhJlIJLdsHS5HwT2XOWu5WpRt6aW6OCN-vN4nx6rdCkDnLri2V7mMTpMaLsI_aMo9kn0Ercb8_36JgkmTXX8xWgztBdbWJIECMid67VOJ6leboTucoXnaVrGBEi1QaCgYKASgSARESFQHsvYlsFoIKRUWwhrF9P-jYtxLq5w0429";
    const destFileName = company +'.csv';
    const url = 'https://cur_bucket-1.storage.googleapis.com/'+ destFileName;
    // const data = new FormData();
    // console.log(selectedFile);
    // const file = new Blob([selectedFile]);
    const file = new Blob([selectedFile], {type: 'multipart/form-data'});
    // data.append('file', file, destFileName); 
    // data.append('file', new Blob([selectedFile], {type: 'text/csv'}))
    console.log("GCS URL we want to upload file to: " + url);
    setisOpen(true);
    await axios.put(url, file, {
        headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "multipart/form-data",
        // "Content-Type": "text/csv",
        // "Access-Control-Request-Headers":"Access-Control-Allow-Origin,Authorization,Content-Type,x-goog-meta-rep_email,x-goog-meta-customer_domain",
        "Authorization": 'Bearer ' + token,
        "x-goog-meta-rep_email": name, 
        "x-goog-meta-customer_domain": company,
        },
        onUploadProgress: function(progressEvent) {
            var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
            setProgress(percentCompleted);
          }
    }).then(function (response) {
        console.log(response);
    });
    setSuccessMessage("Upload Complete. You'll receive the report in your email in a few minutes!");
    setTimeout(() => {
        console.log("success message: " + successMessage);
        refreshPage();
    }, 5000);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Get GCP Pricing</h1>
      <div className="instructions mb-4">
        <p>
          1) Send instructions to your customer on how to obtain their AWS Bill with this: <a href="https://services.google.com/fh/files/helpcenter/getting_aws_bill.pdf">go/aws-export</a> or their <a href="http://go/azure-export">Azure bill</a>.
        </p>
        <p>
          2) Then submit this form with the file that they share with you.
        </p>
        <p>
          3) You'll receive the automated quote via email shortly (up to 5 min).
        </p>
        <p>
          Reach out to @yrvine for any questions, or submit feedback here.
        </p>
        <p>
          In the coming month, we will support:
          <br />
          - Azure files (only support AWS CUR and DBR files for now)
          <br />
          - Detailed errors for users
        </p>
      </div>
      <Form onSubmit={handleFormSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Who should results be sent to? (E.g. CE's email, or Sales Rep's email such as sundar@google.com)</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={handleNameChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Customer's domain (e.g. google.com, newcustomer.ai, without "https://")</Form.Label>
          <Form.Control
            type="text"
            value={company}
            onChange={handleCompanyChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>AWS report (has to be a csv):</Form.Label>
          <Dropzone onDrop={handleFileDrop} accept=".csv">
            {({ getRootProps, getInputProps }) => (
              <div className="dropzone" {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop a CSV file here, or click to select a file from your computer</p>
                <p>{file}</p>                
              </div>
            )}
          </Dropzone>
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    
    {isOpen && (
        <div className="overlay">
    <LinearProgress className="progress" variant="determinate" value={progress}/>
    <p className="success-message">{successMessage}</p>
    </div>)}
    
    </div>
  );
}

export default App;
