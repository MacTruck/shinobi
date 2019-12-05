import React from "react";
import MicroList from "./MicroList.jsx"
import axios from "axios";
import Login from './Login.jsx';
import Signup from "./Signup.jsx";
import Signout from "./Signout.jsx";
import GoogleFunctionForm from "./GoogleFunctionForm.jsx";
import AWSFunctionForm from "./AWSFunctionForm.jsx";
import DockerSetup from "./DockerSetup.jsx";
import AzureFunctionForm from "./AzureFunctionForm.jsx"

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // shinobi
      username: '',
      password: '',
      keys: [],
      // google
      googleKey: '',
      googleKeyAlias: '',
      runtime: undefined,
      googleProject: '',
      // aws
      
      // docker
      dockerUsername: '',
      dockerPassword: '',
      runtimeEnv: '',
      workDir: '',
      runtimeCom: '',
      exposePort: '',
      com: '',
      copy: '',
      //azure
      azureRuntime: '',
      azureTemplate: '',
      azureApp: '',
      azureProject: '',
      // both
      functionName: '',
      uploadedFunction: '',
      //Dropzone prop for file data and text
      uploadedFiles: [],
      // render states
      pageSelect: 'Gcloud',
      isLogin: false,
      isSignup: false,
    };

    this.updateInfo = this.updateInfo.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
    this.handleToggleSignup = this.handleToggleSignup.bind(this);
    this.handleSubmitKey = this.handleSubmitKey.bind(this);
    // this.googleListFunctions = this.googleListFunctions.bind(this);
    this.handleSignout = this.handleSignout.bind(this)
  }

  updateInfo(property, value) {
    let updateObj = {};
    updateObj[property] = value;

    if (property === 'awsKeyAlias') {
      let updateKey = this.state.keys.filter(key => key.keyAlias === value && key.keyType === 'awsSecretAccessKey');
      updateObj.awsAccessKey = updateKey[0].awsAccessKey;
      updateObj.awsSecretAccessKey = updateKey[0].key;
    }
    if (property === 'googleKeyAlias') {
      let updateKey = this.state.keys.filter(key => key.keyAlias === value && key.keyType === 'googleKey');
      updateObj.googleKey = updateKey[0].key;
    }
    this.setState(updateObj);
  }

  handleLogin() {
    axios.post('/db/login', { username: this.state.username, password: this.state.password })
      .then(response => {
        const updateStateObject = {
          isLogin: true,
          keys: response.data.userData.keys,
        };
        response.data.userData.keys.forEach(updateKey => {
          updateStateObject[updateKey.keyType] = updateKey.key;
          if (updateKey.keyType === 'googleKey') {
            updateStateObject.googleKeyAlias = updateKey.keyAlias;
          }
          if (updateKey.keyType === 'awsSecretAccessKey') {
            updateStateObject.awsAccessKey = updateKey.awsAccessKey;
            updateStateObject.awsKeyAlias = updateKey.keyAlias;
          }
        });
        this.setState(updateStateObject, () => {
          console.log(this.state);
        });
        
      });
    }

    handleToggleSignup() {
      this.setState(prevState => ({
        isSignup: !prevState.isSignup
      }));
    }

  handleSignup() {
    axios.post('/db/createNewUser', { username: this.state.username, password: this.state.password })
      .then(() => {
        this.setState({
          isLogin: true,
          isSignup: false,
        });
      });
    }

  handleSignout() {
    axios.post('db/deleteUserFiles', { username: this.state.username })
      .then(() => {
        this.setState({
          username: '',
          password: '',
          keys: [],
          // google
          googleKey: '',
          runtime: undefined,
          googleProject: '',
          // aws
          // docker
          dockerUsername: '',
          dockerPassword: '',
          runtimeEnv: '',
          workDir: '',
          runtimeCom: '',
          exposePort: '',
          com: '',
          copy: '',
          // both
          pageSelect: 'Gcloud',
          functionName: '',
          uploadedFunction: '',
          uploadedFiles: [],
          // render states
          isLogin: false,
          isSignup: false
        })
      });
      console.log(this.state);
      console.log("signout")
  }

  //copy into each "case"
  handleSubmitKey(keyObject) {
    console.log('another key?');
    keyObject.username = this.state.username;
    // switch (keyType) {
    //   case 'googleKey':
    //     keyObject.key = this.state.googleKey;
    //     keyObject.keyAlias = this.state.googleKeyAlias,
    //       axios.post('/gcloud/auth', { key_file: this.state.googleKey })
    //         .then(response => {
    //           if (response.status === 200) {
    //             axios.post('/db/storeKey', keyObject);
    //           }
    //         });
    //     break;
    //   case 'dockerPassword':
    //     keyObject.key = this.state.dockerPassword;
    //     keyObject.dockerUsername = this.state.dockerUsername;
    //     axios.post('/db/storeKey', keyObject);
    //     break;
    // }
    axios
      .post('/db/storeKey', keyObject)
      .then(response => this.setState({
        keys: response.data.keys,
      }));
  }

  // googleListFunctions() {
  //   console.log('inside googleListFunctions')
  //   fetch('/gcloud/list')
  //     .then(data => data.json())
  //     .then(data => {
  //       console.log(`Data from list fetch: ${data}`)
  //       const fnList = data.fn_list;
  //       const fnButtons = [];
  //       fnList.forEach((el) => {
  //         fnButtons.push(<div id={el}>
  //           <span>{el}</span>
  //           <button onClick={() => {
  //             fetch(`/gcloud/info/${el}`)
  //               .then(data => data.json())
  //               .then(data => {
  //                 console.log(data);
  //               })
  //           }}>Info</button>
  //           <button onClick={() => {
  //             fetch(`/gcloud/call/${el}`)
  //               .then(data => data.json())
  //               .then(data => {
  //                 console.log(data);
  //               })
  //           }}>Invoke</button>
  //           <button onClick={() => {
  //             fetch(`/gcloud/delete/`, {
  //               method: 'DELETE',
  //               headers: {
  //                   'Content-Type': 'application/json',
  //               },
  //               body: JSON.stringify({fn_name: el}),
  //             })
  //               .then(data => data.json())
  //               .then(data => {
  //                 console.log(data);
  //               })
  //           }}>Delete</button>
  //         </div>);
  //       });
  //       console.log(`fnButtons: ${fnButtons}`)
  //       return fnButtons;
  //     })
  // }

  render() {

    let displayed;

    if ((this.state.pageSelect === 'Gcloud' && this.state.isLogin)) {
      displayed = <GoogleFunctionForm
        submitKey={this.handleSubmitKey}
        googleProject={this.state.googleProject}
        runtime={this.state.runtime}
        functionName={this.state.functionName}
        googleKey={this.state.googleKey}
        updateInfo={this.updateInfo}
        uploadedFunction={this.state.uploadedFunction}
        /*googleListFunctions={this.googleListFunctions}*/
        keys={this.state.keys}
      />
    } else if (this.state.pageSelect === 'Lambda' && this.state.isLogin) {
      displayed = (<React.Fragment>
        <AWSFunctionForm id="AWSFunctionForm"
          submitKey={this.handleSubmitKey}
          keys={this.state.keys}
        /></React.Fragment>)
    } else if ((this.state.pageSelect === 'Docker' && this.state.isLogin)) {
      displayed = (<React.Fragment><DockerSetup id="DockerSetup"
        code={this.state.uploadedFunction}
        runtimeEnv={this.state.runtimeEnv}
        workDir={this.state.workDir}
        runtimeCom={this.state.runtimeCom}
        exposePort={this.state.exposePort}
        com={this.state.com}
        updateInfo={this.updateInfo}
        submitKey={this.submitKey}
        functionName={this.state.functionName}
        copy={this.state.copy}
        uploadedFiles={this.state.uploadedFiles}
        pageSelect={this.state.pageSelect}
      ></DockerSetup></React.Fragment>)
    } else if (this.state.pageSelect === 'Azure' && this.state.isLogin) {
      displayed = (<React.Fragment>
        <AzureFunctionForm
          updateInfo={this.updateInfo}
          azureRuntime={this.state.azureRuntime}
          azureTemplate={this.state.azureTemplate}
          azureApp={this.state.azureApp}
          azureProject={this.state.azureProject}
          functionName={this.state.functionName}
        />
      </React.Fragment>)
    }

    return (
      <div className="mainContainer">
        <h1>Shinobi</h1>
        {!this.state.isLogin && !this.state.isSignup && (
          <Login
            updateInfo={this.updateInfo}
            handleLogin={this.handleLogin}
            handleToggleSignup={this.handleToggleSignup}
          />
        )}
        {this.state.isSignup && (
          <Signup
            updateInfo={this.updateInfo}
            handleSignup={this.handleSignup}
            handleToggleSignup={this.handleToggleSignup}
          />
        )}
        {this.state.isLogin && !this.state.isSignup && (
          <Signout
            handleSignout={this.handleSignout}
          />
        )}

        { this.state.isLogin && <MicroList pageSelect={this.state.pageSelect} updateInfo={this.updateInfo} /> }
        {displayed}
      </div>
    );
  }
}

export default App;
