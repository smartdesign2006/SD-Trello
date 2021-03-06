import React, { useCallback, useState } from 'react'
import { useSocket } from '../../../contexts/SocketProvider'
import AddProjectElement from '../AddProjectElement'
import useListsServices from '../../../services/useListsServices'

const AddList = ({ project, handleInputRemove }) => {
    const [listName, setListName] = useState('')
    const socket = useSocket()
    const { createList } = useListsServices()

    const handleSubmit = useCallback(async () => {
        if (!listName) {
            return handleInputRemove()
        }

        await createList(project._id, listName)

        socket.emit('project-update', project)
        handleInputRemove()
            
    }, [createList, listName, project, handleInputRemove, socket])

    return (
        <AddProjectElement
            elementName={listName}
            setElementName={setListName}
            handleSubmit={handleSubmit}
            handleInputRemove={handleInputRemove}
            placeholder='Enter new list name:'
        />
    )
}

export default AddList