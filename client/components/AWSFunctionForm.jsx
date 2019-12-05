import React from "react";
import MyDropzone from "./MyDropzone.jsx";
import AWSCredentials from './AWSCredentials.jsx';
import AWSCurrentFunctions from './AWSCurrentFunctions.jsx'
import axios from "axios";

class AWSFunctionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      awsAccessKey: '',
      awsSecretAccessKey: '',
      awsKeyAlias: '',
      S3BucketName: '',
      newBucketRegion: "",
      currRegion: "",
      currentBuckets: [],
      codeHere: "",
      currentFunctions: [],
      awsRegion: '',
      awsRuntime: '',
      awsRole: '',
      awsAccountID: '',
      codeLoaded: '',
      functionName: '',
      uploadedFunction: '',
      keys: this.props.keys,
    }
    // Method binding
    this.packageKey = this.packageKey.bind(this);
    this.updateInfo = this.updateInfo.bind(this);
    this.getFuncInfo = this.getFuncInfo.bind(this);
    this.listFunctions = this.listFunctions.bind(this)
    this.listBuckets = this.listBuckets.bind(this)
    this.createFunction = this.createFunction.bind(this);
    this.configureAWS = this.configureAWS.bind(this);
    this.createBucket = this.createBucket.bind(this);
  }

  // AWS Methods
  updateInfo(property, value) {
    const updateObj = {};
    updateObj[property] = value;
    if (property === 'awsKeyAlias') {
      let updateKey = this.state.keys.filter(key => key.keyAlias === value && key.keyType === 'awsSecretAccessKey');
      if (updateKey.length) {
        updateObj.awsAccessKey = updateKey[0].awsAccessKey;
        updateObj.awsSecretAccessKey = updateKey[0].key;
      }
    }
    this.setState(updateObj);
  }

  packageKey() {
    const keyObject = {
      keyType: 'awsSecretAccessKey',
      key: this.state.awsSecretAccessKey,
      awsAccessKey: this.state.awsAccessKey,
      keyAlias: this.state.awsKeyAlias,
    }
    this.props.submitKey(keyObject);
  }

  getawsAccountID() {
    axios
      .post("/aws/getawsAccountID", {
        username: this.state.username
      })
      .then(response => {
        this.setState({ awsAccountID: response.data.Account });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  configureAWS() {
    axios
      .post("/aws/configureAWS", {
        awsAccessKey: this.state.awsAccessKey,
        awsSecretAccessKey: this.state.awsSecretAccessKey,
        awsRegion: this.state.awsRegion,
        username: this.props.username
      })
      .then((response) => {
        setTimeout(() => this.listFunctions(), 4000);
        setTimeout(() => this.listBuckets(), 4000)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  listFunctions() {
    let allFuncArray = [];
    axios
      .post("/aws/listFunctions", {
        username: this.props.username
      })
      .then(data => {
        for (let i = 0; i < data.data.Functions.length; i++) {
          let funcName = data.data.Functions[i].FunctionName;
          allFuncArray.push(<div className="myAWSFuncs" key={i}>{funcName} <button onClick={() => this.getFuncInfo(funcName)}>Get Info</button><button onClick={() => this.loadCode(funcName)}>Load Code</button><button onClick={() => this.invokeFunc(funcName)}>Invoke</button><button onClick={() => this.deleteFunc(funcName)}>Delete Function</button></div>)
        }
        this.setState({ currentFunctions: allFuncArray });
        this.getawsAccountID();
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  loadCode(funcName) {
    axios
      .post("/aws/loadCode", {
        funcName,
        username: this.props.username
      })
      .then(response => {
        this.setState({
          codeLoaded: response.data
        });
      })
      .catch(error => console.log(error))
  }

  getFuncInfo(funcName) {
    axios
      .post("/aws/getFuncInfo", {
        funcName,
        username: this.props.username
      })
      .then(response => {
        alert(`State: ${response.data.Configuration.State}
        \nRuntime: ${response.data.Configuration.Runtime}
        \nLast Modified: ${(new Date(Date.parse(response.data.Configuration.LastModified))).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
        \nRole: ${response.data.Configuration.Role}`)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  invokeFunc(funcName) {
    axios
      .post("/aws/invokeFunc", {
        funcName,
        username: this.props.username
      })
      .then(data =>
        console.log(data.data))
      .catch(function (error) {
        console.log(error);
      });
    alert("Function invoked.")
  }

  deleteFunc(funcName) {
    axios
      .post("/aws/deleteFunc", {
        funcName,
        username: this.props.username
      })
      .then(data => {
        this.listFunctions()
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  createFunction() {
    if (this.state.functionName 
      && this.state.uploadedFunction 
      && this.state.awsRuntime 
      && this.state.awsRole 
      && this.state.awsRegion) {
      axios
      .post("aws/createFunction", {
          functionName: this.state.functionName,
          uploadedFunction: this.state.uploadedFunction,
          awsRuntime: this.state.awsRuntime,
          awsRole: this.state.awsRole,
          awsAccountID: this.state.awsAccountID,
          username: this.state.username
      })
      .then((response) => {
        console.log("createFunction FRONT END response --->", response);
        setTimeout(() => this.listFunctions(), 4000);
      })
      .catch((error) => {
        console.log(error);
      });
    } else {
      alert("Please enter Region, Function Name, Runtime, Role, and Code to create function")
    }
  }

  listBuckets() {
    let allBuckets = [<option defaultValue={"a"}> -- select an option -- </option>]
    axios
      .post("/aws/allBuckets", { username: this.state.username })
      .then(response => {
        for (let i = 0; i < response.data.Buckets.length; i++) {
          let bucketName = response.data.Buckets[i].Name;
          allBuckets.push(
            <option className="myAWSBuckets" key={i} value={bucketName}>
              {bucketName}
            </option >)
        }
        this.setState({ currentBuckets: allBuckets })
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  createBucket() {
    axios.post("/aws/createBucket", {
      S3BucketName: this.state.S3BucketName,
      newBucketRegion: this.state.newBucketRegion,
      username: this.state.username
    })
      .then(data => {
        console.log(data)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <React.Fragment>
        <h2>AWS</h2>
        <h4>Configuration</h4>
        <AWSCredentials
          keys={this.props.keys}
          awsAccessKey={this.state.awsAccessKey}
          awsSecretAccessKey={this.state.awsSecretAccessKey}
          awsKeyAlias={this.state.awsKeyAlias}
          updateInfo={this.updateInfo}
          packageKey={this.packageKey}
          configureAWS={this.configureAWS}
        />
        <hr />
        <AWSCurrentFunctions
          id="AWSCurrentFunctions"
          currentFunctions={this.state.currentFunctions}
          currRegion={this.state.currRegion}
          functionName={this.state.functionName}
          codeHere={this.state.codeHere}
          currentBuckets={this.state.currentBuckets}
        />
        <h4>Create Function</h4>
        <input
          type="text"
          id="functionName" 
          name="functionName"
          placeholder="Function Name"
          onChange={(e) => this.updateInfo(e.target.name, e.target.value)}
        />
        <input
          type="text"
          id="awsRole"
          name="awsRole"
          defaultValue=":role/"
          onChange={e => this.updateInfo(e.target.name, e.target.value)}
        />
        <select id="awsRuntime" name="awsRuntime" onChange={e => this.updateInfo(e.target.name, e.target.value)} >
          <option defaultValue={"a"}> -- select runtime -- </option>
          <option value="nodejs8.10">Node 8</option>
          <option value="nodejs10.x">Node 10</option>
          <option value="java8">Java 8</option>
          <option value="python2.7">Python 2.7</option>
          <option value="python3.6">Python 3.6</option>
          <option value="python3.8">Python 3.8</option>
          <option value="go1.x">Go 1.11</option>
          <option value="dotnetcore2.1">Dotnetcore 2.1</option>
          <option value="ruby2.5">Ruby 2.5</option>
        </select>

        <MyDropzone 
          uploadedFunction={this.state.uploadedFunction}
          codeLoaded={this.state.codeLoaded}
          updateInfo={this.updateInfo}
        />
        <button
          id="createFuncBtn"
          onClick={() => this.createFunction()}>
            Create Function
        </button>
      </React.Fragment>
    );
  };
};

export default AWSFunctionForm;