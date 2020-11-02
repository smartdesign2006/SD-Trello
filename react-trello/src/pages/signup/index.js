import React, { Component, useContext, useState } from "react";
import SubmitButton from "../../components/button/submit-button";
import Input from "../../components/input";
import PageLayout from "../../components/page-layout";
import Title from "../../components/title";
import styles from "./index.module.css";
import authenticate from "../../utils/authenticate";
import UserContext from "../../Context";
import { useHistory } from "react-router-dom";

const SignupPage = (props) => {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [rePassword, setRePassword] = useState(null);
    const [alert, setAlert] = useState(false);
    const context = useContext(UserContext);
    const history = useHistory();

    const onChange = (event, type) => {
        switch (type) {
            case 'username':
                setUsername(event.target.value);
                break;
            case 'password':
                setPassword(event.target.value);
                break;
            case 'rePassword':
                setRePassword(event.target.value);
                break;
            default:
                break;
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== rePassword) {
            setAlert(true)
            return
        }

        await authenticate("http://localhost:4000/api/user/register", {
            username,
            password
        }, (user) => {
            context.logIn(user);
            history.push("/");
        }, (e) => {
            console.log("Error", e);
        })

    };

    return (
        <PageLayout>
            {alert ? (<div className={styles.alert}>
                Passwords do not match
            </div>) : null}
            <form className={styles.container} onSubmit={handleSubmit}>
                <Title title="Register" />
                <Input
                    value={username}
                    onChange={(e) => onChange(e, "username")}
                    label="Username"
                    id="username"
                />
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => onChange(e, "password")}
                    label="Password"
                    id="password"
                />
                <Input
                    type="password"
                    value={rePassword}
                    onChange={(e) => onChange(e, "rePassword")}
                    label="Re-Password"
                    id="re-password"
                />

                <SubmitButton title="Register" />
            </form>
        </PageLayout>
    )

}

// class SignupPage extends Component {
//     constructor(props) {
//         super(props)

//         this.state = {
//             username: "",
//             password: "",
//             rePassword: "",
//             alert: false
//         }
//     }

//     static contextType = UserContext;

//     onChange = (event, type) => {
//         const newState = {};
//         newState[type] = event.target.value

//         this.setState(newState)
//     }

//     handleSubmit = async (event) => {
//         event.preventDefault();
//         const {
//             username,
//             password,
//             rePassword
//         } = this.state;

//         if (password !== rePassword) {
//             const newState = {}
//             newState.alert = true
//             this.setState(newState)
//             return
//         }

//         await authenticate("http://localhost:4000/api/user/register", {
//             username,
//             password
//         }, (user) => {
//             this.context.logIn(user);
//             this.props.history.push("/");
//         }, (e) => {
//             console.log("Error", e);
//         })

//     };

//     render() {

//         const {
//             username,
//             password,
//             rePassword,
//             alert
//         } = this.state;

//         return (
//             <PageLayout>
//                 {alert ? (<div className={styles.alert}>
//                     Passwords do not match
//                 </div>) : null}
//                 <form className={styles.container} onSubmit={this.handleSubmit}>
//                     <Title title="Register" />
//                     <Input
//                         value={username}
//                         onChange={(e) => this.onChange(e, "username")}
//                         label="Username"
//                         id="username"
//                     />
//                     <Input
//                         type="password"
//                         value={password}
//                         onChange={(e) => this.onChange(e, "password")}
//                         label="Password"
//                         id="password"
//                     />
//                     <Input
//                         type="password"
//                         value={rePassword}
//                         onChange={(e) => this.onChange(e, "rePassword")}
//                         label="Re-Password"
//                         id="re-password"
//                     />

//                     <SubmitButton title="Register" />
//                 </form>
//             </PageLayout>
//         )
//     }
// }

export default SignupPage;