import React, { useContext, useState, useEffect, useCallback } from "react"
import styles from "./index.module.css"
import TeamContext from "../../contexts/TeamContext"
import ProjectContext from "../../contexts/ProjectContext"
import { useHistory, useParams } from "react-router-dom"
import getCookie from "../../utils/cookie"
import { useSocket } from "../../contexts/SocketProvider"
import SearchField from "../searchField"
import TeamDropdown from "../header-dropdowns/team-dropdown"
import ProjectDropdown from "../header-dropdowns/project-dropdown"
import ViewDropdown from "../header-dropdowns/view-dropdown"
import ProfileDropdown from "../header-dropdowns/profile-dropdown"

const Header = ({ asideOn }) => {
    const [isProjectVisibble, setIsProjectVisibble] = useState(false)
    const [isViewVisibble, setIsViewVisibble] = useState(false)
    const projectContext = useContext(ProjectContext)
    const teamContext = useContext(TeamContext)
    const params = useParams()
    const history = useHistory()
    const socket = useSocket()

    const getData = useCallback(async () => {
        const id = params.projectid
        const token = getCookie("x-auth-token");
        const response = await fetch(`/api/projects/info/${id}`, {
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
            projectContext.setProject(data)
        }
    }, [history, params, projectContext])

    useEffect(() => {
        if (!(window.location.href.includes('team') || window.location.href.includes('project'))) {
            teamContext.setSelectedTeam('Select')
        } else if (teamContext.selectedTeam === 'Select') {
            const teamId = params.teamid
            teamContext.updateSelectedTeam(teamId)
        }

        if (window.location.href.includes('project')) {
            setIsViewVisibble(true)
            setIsProjectVisibble(true)
            teamContext.getCurrentProjects(params.teamid)

            if (projectContext.project === null || projectContext.project._id !== params.projectid) {
                getData()
            }
        }
    }, [getData, params, params.teamid, projectContext.project, teamContext,])

    useEffect(() => {
        if (!(window.location.href.includes('team') || window.location.href.includes('project'))) return
        if (socket == null) return
        socket.on('team-deleted', goToHomePage)
        return () => socket.off('team-deleted')
    })

    useEffect(() => {
        if (!window.location.href.includes('project')) return
        if (socket == null) return
        socket.on('project-deleted', goToTeamPage)
        return () => socket.off('project-deleted')
    })

    async function goToHomePage(deletedTeamId) {
        if (deletedTeamId !== params.teamid) return
        history.push('/')
    }

    function goToTeamPage(deletedProjectId) {
        if (deletedProjectId !== params.projectid) return
        history.push(`/team/${params.teamid}`)
    }

    if (window.location.href.includes('project') && !projectContext.project) {
        return null
    }

    return (
        <header className={`${styles.navigation} ${asideOn ? styles.small : ''}`} >
            <div className={styles.container}>
                <div className={styles.links}>
                    <TeamDropdown/>
                    {isProjectVisibble && <ProjectDropdown/>}
                    {isViewVisibble && <ViewDropdown/>}
                </div>

                <div className={`${styles.links} ${styles.font}`}>
                    <SearchField asideOn={asideOn} />
                    <ProfileDropdown/>
                </div>
            </div>
        </header>
    )
}

export default Header