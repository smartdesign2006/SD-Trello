import React, { useCallback, useState } from 'react'
import { useHistory } from "react-router-dom"
import SubmitButton from '../button/submit-button'
import Input from '../input'
import Title from '../title'
import styles from './index.module.css'
import getCookie from '../../utils/cookie'

export default function EditCard(props) {
    const [name, setName] = useState(props.card.name)
    const [description, setDescription] = useState(props.card.description)
    const [dueDate, setDueDate] = useState(props.card.dueDate)
    const [progress, setProgress] = useState(props.card.progress)
    const history = useHistory()
 
    const cardId = props.card._id
    const listId = props.listId

    const cancelSubmit = () => {
        props.hideFormEdit()
    }
    const deleteCard = useCallback(async (event) => {
        event.preventDefault()
        const token = getCookie("x-auth-token")
        const response = await fetch(`http://localhost:4000/api/projects/lists/cards/${listId}/${cardId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }           
        })
        if (!response.ok) {
            history.push("/error")
        } else {
            props.hideFormEdit()
        }

    }, [history, props, cardId, listId])


    const handleSubmit = useCallback(async (event) => {
        event.preventDefault()
        const token = getCookie("x-auth-token")
        const response = await fetch(`http://localhost:4000/api/projects/lists/cards/${listId}/${cardId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                name,
                description,
                dueDate,
                progress,
                members: []
            })
        })
        if (!response.ok) {
            history.push("/error")
        } else {
            props.hideFormEdit()
        }

    }, [history, name, description, dueDate, progress, listId, cardId, props])

    return (
        <div className={styles.form}>
            <form className={styles.container} >
                <Title title="Edit Card" />
                <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    label="Name"
                    id="name"
                />
                <Input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    label="Description"
                    id="description"
                />
                <Input
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    label="Due Date"
                    id="dueDate"
                />
                <Input
                    value={progress}
                    onChange={e => setProgress(e.target.value)}
                    label="Progress"
                    id="progress"
                />
                <SubmitButton onClick={handleSubmit} title="Edit" />
                <SubmitButton onClick={cancelSubmit} title="Cancel" />
                <SubmitButton onClick={deleteCard} title="Delete" />
            </form>
        </div>
    )
}
