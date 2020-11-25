import React, { useState, useEffect, useCallback, useContext } from "react"
import { useHistory } from "react-router-dom"
import PageLayout from "../../components/page-layout"
import getCookie from "../../utils/cookie"
import Project from '../../components/project'
import Button from "../../components/button"
import Transparent from "../../components/transparent"
import CreateProject from '../../components/create-project'
import Loader from "react-loader-spinner"
import TeamContext from "../../contexts/TeamContext"

const TeamPage = () => {

    const [projects, setProjects] = useState(null)
    const [isVisible, setIsVisible] = useState(false)
    const history = useHistory()

    const getData = useCallback(async () => {

        const token = getCookie("x-auth-token");

        const response = await fetch(`http://localhost:4000/api/projects/all`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        })
        if (!response.ok) {
            history.push("/error")
        } else {
            const data = await response.json()
            setProjects(data)
        }
    }, [history])


    useEffect(() => {
        getData()
    }, [getData])

    if (!projects) {
        return (
            <PageLayout>
                <Loader
                    type="TailSpin"
                    color="#363338"
                    height={100}
                    width={100}
                    timeout={3000} //3 secs
                />
            </PageLayout>
        )
    }

    return (
        <PageLayout>
            <div>
                {projects.map((project, index) => {
                    return (
                        <Project key={project._id} index={index} project={project} />
                    )
                })}
            </div>
            <Button title='New Project' onClick={() => setIsVisible(true)} />
            {
                isVisible ?
                    <div>
                        <Transparent hideForm={() => setIsVisible(false)}>
                            <CreateProject hideForm={() => setIsVisible(false)} />
                        </Transparent>
                    </div> : null
            }
        </PageLayout>
    )
}

export default TeamPage;