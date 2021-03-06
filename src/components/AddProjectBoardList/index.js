import React, { useContext, useState } from 'react'
import ProjectContext from '../../contexts/ProjectContext'
import { useSocket } from '../../contexts/SocketProvider'
import styles from './index.module.css'
import ButtonClean from '../ButtonClean'
import ProjectBoardInput from '../Inputs/ProjectBoardInput'
import useListsServices from '../../services/useListsServices'
import { useDetectOutsideClick } from '../../utils/useDetectOutsideClick'

const AddProjectBoardList = () => {
    const { project } = useContext(ProjectContext)
    const socket = useSocket()
    const [listName, setListName] = useState('')
    const [isAddListActive, setIsAddListActive, listRef] = useDetectOutsideClick()
    const { createList } = useListsServices()

    const addList = async () => {
        if (listName === '') {
            setIsAddListActive(false)
            return
        }

        await createList(project._id, listName)
        setIsAddListActive(false)
        setListName('')
        socket.emit('project-update', project)
    }

    return (
        <div className={styles.list} >
            { isAddListActive ?
                <div ref={listRef} className={styles.container} >
                    <ProjectBoardInput
                        value={listName}
                        setValue={setListName}
                        onEnter={addList}
                        onEscape={() => setIsAddListActive(false)}
                    />
                    <ButtonClean
                        className={styles.button}
                        onClick={addList}
                        title='+ Add List'
                    />
                </div>
                :
                <ButtonClean
                    className={styles.button}
                    onClick={() => setIsAddListActive(true)}
                    title='+ Add List'
                />
            }
        </div>
    )
}

export default AddProjectBoardList