import React, { useCallback, useRef, useState } from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { useHistory, useParams } from 'react-router-dom'
import { useSocket } from '../../contexts/SocketProvider'
import getCookie from '../../utils/cookie'
import { useDetectOutsideClick } from '../../utils/useDetectOutsideClick'
import Card from '../Card'
import styles from './index.module.css'
import dots from '../../images/dots.svg'
import ButtonClean from '../ButtonClean'
import ListColor from '../ListColor'
import ButtonGrey from '../ButtonGrey'
import ConfirmDialog from '../ConfirmationDialog'


export default function List( { isAdmin, project, list, showEditList, showCurrentCard, setCurrCard }) {
    const dropdownRef = useRef(null);
    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useDetectOutsideClick(cardRef)
    const [isEditListActive, setIsEditListActive] = useDetectOutsideClick(dropdownRef)
    const [cardName, setCardName] = useState('')
    const [confirmOpen, setConfirmOpen] = useState(false)
    const history = useHistory()
    const socket = useSocket()
    const params = useParams()
    const teamId = params.teamid



    const updateSocket = useCallback(() => {
        socket.emit('project-update', project)
    }, [socket, project])

    async function deleteList() {
        const token = getCookie("x-auth-token")
        const response = await fetch(`/api/projects/lists/${project._id}/${list._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        })
        if (!response.ok) {
            history.push("/error")
        } else {
            updateSocket()
            socket.emit('task-team-update', teamId)
        }
    }

    const addCard = useCallback(async (event) => {
        event.preventDefault()
        if (cardName === '') {
            return
        }
        const token = getCookie("x-auth-token")
        const response = await fetch(`/api/projects/lists/cards/${list._id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                name: cardName,
                description: '',
                dueDate: '',
                progress: '',
                members: []

            })
        })
        if (!response.ok) {
            history.push("/error")
            return
        } else {
            setIsVisible(!isVisible)
            setCardName('')
            updateSocket()
        }

    }, [history, cardName, list._id, updateSocket, isVisible, setIsVisible])

    function editList() {
        showEditList()
        setIsEditListActive(!isEditListActive)
    }

    return (
        
        <div className={styles.list}>
            {confirmOpen &&
                <ConfirmDialog
                    title={'you wish to delete this list'}
                    hideConfirm={() => setConfirmOpen(false)}
                    onConfirm={() => deleteList()}
                />
            }
            <div className={styles.row}>
                <div>
                    <div className={styles.name} title={list.name} >{list.name}</div>
                    <ListColor color={list.color || '#A6A48E'} type={'list'} />
                </div>
                {
                    isAdmin &&
                    <ButtonClean
                        className={styles.button}
                        onClick={() => setIsEditListActive(!isEditListActive)}
                        title={<img className={styles.dots} src={dots} alt="..." width="20" height="6" />}
                    />
                }
            </div>
            <div className={styles.relative}>
                {isEditListActive && <div ref={dropdownRef} className={`${styles.menu}`} >
                        <ButtonGrey
                            onClick={editList}
                            title='Edit'
                            className={styles.edit}
                        />
                        <ButtonGrey
                        
                            onClick={() => setConfirmOpen(true)}
                            title='Delete'
                            className={styles.delete}
                        />
                </div>}
            </div>
            <Droppable droppableId={list._id} type='droppableSubItem'>
                {(provided) => (
                    <div className={styles.droppable} ref={provided.innerRef}>
                        {
                            list.cards.map((element, index) => {
                                return (
                                    <Draggable key={element._id} draggableId={element._id}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div>
                                                <div {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef} >
                                                    <Card
                                                        card={element}
                                                        project={project}
                                                        showCurrentCard={showCurrentCard}
                                                        setCurrCard={setCurrCard}
                                                    />
                                                </div>
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            })
                        }
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <div className={styles.flexend} >
                {
                    isVisible ?
                        <form ref={cardRef} className={styles.container} >
                            <input
                                autoFocus
                                className={styles['task-input']}
                                type={'text'}
                                value={cardName}
                                onChange={e => setCardName(e.target.value)}
                            />
                            <ButtonClean type='submit' className={styles['add-task']} onClick={addCard} title='+ Add Task' project={project} />
                        </form> : <ButtonClean className={styles['add-task']} onClick={() => setIsVisible(!isVisible)} title='+ Add Task' />

                }
            </div>
        </div>
    )
}
