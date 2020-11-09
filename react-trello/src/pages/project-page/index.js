import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useHistory } from "react-router-dom"
import List from '../../components/list'
import PageLayout from '../../components/page-layout'
import getCookie from '../../utils/cookie'
import styles from './index.module.css'

export default function ProjectPage() {
    const params = useParams()
    const history = useHistory()
    const [project, setProject] = useState(null)
    const [members, setMembers] = useState([])

    const getData = useCallback(async () => {
        const id = params.projectid
        const token = getCookie("x-auth-token");

        const response = await fetch(`http://localhost:4000/api/projects/info/${id}`, {
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
            setProject(data)

            const memberArr = []
            data.membersRoles.map(element => {
                return memberArr.push({ admin: element.admin, username: element.memberId.username })

            })
            setMembers(memberArr)

        }

    }, [params.projectid, history])

    useEffect(() => {
        getData()
    }, [getData])

    if (!project) {
        return (
            <PageLayout>
                <div>Loading...</div>
            </PageLayout>
        )
    }

    return (
        <PageLayout className={styles.conteiner}>
            <div>{project.name}</div>
            <div>Admins :{members.filter(a => a.admin === true).map(element => {
                return (
                    <div>
                        {element.username}
                    </div>
                )
            })}</div>
            <div>Members :{members.filter(a => a.admin === false).map(element => {
                return (
                    <div>
                        {element.username}
                    </div>
                )
            })}</div>
            {
                project.lists.map(element => {
                    return (
                        <List key={element._id} list={element}/>
                    )
                })
            }
        </PageLayout>
    )
}