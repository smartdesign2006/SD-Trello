import React, { useState, useRef, useEffect } from 'react'
import ButtonClean from '../button-clean'
import pen from '../../images/pen.svg'
import attPic from '../../images/edit-card/pic6.svg'
import styles from "./index.module.css"
import Transparent from '../transparent'
import EditCard from '../edit-card'
import getCookie from '../../utils/cookie'
import { useHistory } from 'react-router-dom'
import { useSocket } from '../../contexts/SocketProvider'
import AttachmentList from '../attachmentList'
import { useDetectOutsideClick } from '../../utils/useDetectOutsideClick'

export default function MyTasksTask({ currTeam, project, list, card }) {
    const inputRef = useRef(null)
    const listRef = useRef(null)
    const [isInputActive, setIsInputActive] = useState(false)
    const [showEditCard, setShowEditCard] = useState(false)
    const [showAttachments, setShowAttachments] = useDetectOutsideClick(listRef)
    const [progress, setProgress] = useState('')
    const [isInputOk, setIsInputOk] = useState(true)
    const history = useHistory()
    const socket = useSocket()
    const days = Math.ceil((Date.parse(card.dueDate) - Date.now()) / 1000 / 3600 / 24)

    useEffect(() => {
        if (card.progress === null) {
            setProgress('Add')
            return
        }
        setProgress(card.progress + '%')
    }, [setProgress, card.progress])

    async function onBlur() {
        setIsInputActive(false)
        if (!isInputOk || Number(progress) === card.progress) {
            setProgress(card.progress + '%')
            setIsInputOk(true)
            return
        }

        if (progress === '') {
            if (card.progress === null) {
                setProgress('Add')
                return
            }
            setProgress(card.progress + '%')
        }

        const today = new Date(Date.now())
        let arr = [...card.history]

        arr.push({
            'event': `Progress ${progress}%`,
            'date': today
        })

        const token = getCookie("x-auth-token")
        const response = await fetch(`/api/projects/lists/cards/${list._id}/${card._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                progress: progress,
                history: arr
            })
        })
        if (!response.ok) {
            history.push("/error")
            return
        } else {
            socket.emit('project-update', project)
            socket.emit('task-team-update', currTeam._id)
        }
    }

    function onKeyUp() {
        if (Number.isNaN(Number(progress)) || Number(progress) < 0 || Number(progress) > 100) {
            setIsInputOk(false)
        } else {
            setIsInputOk(true)
        }
    }

    function onFocus() {
        setIsInputActive(true)
        if (progress === 'Add') {
            setProgress('')
            return
        }
        setProgress(Number(progress.slice(0, -1)))
    }

    return (
        <div key={card._id} className={styles.card}>
            <div className={styles.task}>{card.name}</div>
            {/* <div className={styles.list}>{list.name}</div> */}
            <div className={styles.progress}>
                <input
                    ref={inputRef}
                    type={'text'}
                    className={`${styles.input} ${!isInputOk && styles['bad-input']} ${!isInputActive && styles['no-border']}`}
                    autoComplete="off"
                    value={progress}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyUp={onKeyUp}
                    onChange={e => setProgress(e.target.value)}
                />
            </div>
            <div className={styles.days}>
                {
                    card.progress === 100 ? (<div>Done</div>) :
                        Date.parse(card.dueDate) === 0 || card.dueDate === null ? (<div>No Deadline</div>) :
                            days < 0 ? (<div className={styles.deadline}>Deadline Passed</div>) :
                                <div>{days}</div>
                }
            </div>
            <div className={styles['buttons-container']}>
                {card.attachments.length > 0 && <ButtonClean
                    className={styles.button}
                    onClick={() => setShowAttachments(true)}
                    title={<img src={attPic} alt="" width="14" />}
                />}
                <ButtonClean
                    className={styles.button}
                    onClick={() => setShowEditCard(true)}
                    title={<img src={pen} alt="" width="14" />}
                />
            </div>
            {showAttachments && <Transparent hideForm={() => setShowAttachments(false)} >
                <AttachmentList
                    listRef={listRef}
                    attachments={card.attachments}
                    card={card}
                    project={project}
                    teamId={currTeam._id}
                />
            </Transparent >}
            {showEditCard && <div className={styles.edit}>
                <Transparent hideForm={() => setShowEditCard(!showEditCard)} >
                    <EditCard
                        hideForm={() => setShowEditCard(!showEditCard)}
                        initialCard={card}
                        listId={list._id}
                        project={project}
                        teamId={currTeam._id}
                    />
                </Transparent>
            </div>}
        </div>
    )
}
