import React, { useCallback, useEffect, useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import styles from './index.module.css'
import ReactTable from "react-table";
import "react-table/react-table.css";
import Button from "../button";
import DatePicker from "react-datepicker"
import Avatar from "react-avatar";
import TaskName from '../calendar-data/task-name'
import TaskProgress from "../calendar-data/task-progress";
import TaskDueDate from "../calendar-data/task-dueDate";
import CreateCard from '../create-card'
import AddList from "../calendar-data/add-list";
import ButtonClean from "../button-clean";
import AddTask from "../calendar-data/add-task";
import { useDetectOutsideClick } from "../../utils/useDetectOutsideClick";
import { useHistory } from "react-router-dom";
import { useSocket } from "../../contexts/SocketProvider";
import Transparent from "../transparent";
import getCookie from "../../utils/cookie";
import TaskMembers from "../calendar-data/task-members";




const TableDndApp = (props) => {

    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

    const [startDay, setStartDay] = useState(today)
    const [tableData, setTableData] = useState([])
    const [tableSize, setTableSize] = useState(10)
    const [IsVisibleEdit, setIsVisibleEdit] = useState(false)
    const dropdownRef = useRef(null);
    const [isActive, setIsActive] = useDetectOutsideClick(dropdownRef, false)
    const [isVisible, setIsVisible] = useState(false)

    const [cardName, setCardName] = useState('')
    const history = useHistory()
    const socket = useSocket()




    const showFormEdit = () => {
        setIsVisibleEdit(true)
    }

    const hideFormEdit = () => {
        setIsVisibleEdit(false)
    }


    const shownDay = (value) => {
        let date = ''
        date = (value.getDate()) + ' ' + (value.toLocaleString('default', { month: 'short' }))
        return date
    }

    const weekDay = (value) => {
        let num = value.getDay()
        const weekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if (num > 6) {
            num = num - 7
        }
        var weekDay = weekArray[num]
        return weekDay
    }



    let numberOfRows = 0

    const cardData = useCallback(async () => {

        let data = []
        const lists = props.project.lists
        lists.map((list) => {
            numberOfRows++
            let listCards = list.cards
            data.push({
                task: (
                    <div className={styles.listName} >
                        <span> {list.name} </span>
                    </div >
                ),
                progress: '',
                assigned: '',
                monday: '',
                tuesday: '',
                wednesday: '',
                thursday: '',
                friday: '',
                saturday: '',
                sunday: '',
                dueDate: (
                    <AddTask listId={list._id} project={props.project} />
                )
            })



            listCards.forEach(card => {

                numberOfRows++

                let cardDate = ''
                let thisCardDate = ''
                if (card.dueDate) {
                    cardDate = new Date(card.dueDate)
                    thisCardDate = cardDate.getTime()
                }
                data.push({

                    task: (
                        <TaskName value={card.name + '/' + card._id + '/' + list._id} props={props} project={props.project} />
                    ),
                    progress: (
                        <TaskProgress value={card.progress + '/' + card._id + '/' + list._id} props={props} project={props.project} />
                    ),
                    assigned:
                        (
                            <TaskMembers cardMembers={card.members} cardId={card._id} listId={list._id} project={props.project} />
                        ),
                    monday: thisCardDate + "/" + card.progress,
                    tuesday: thisCardDate + "/" + card.progress,
                    wednesday: thisCardDate + "/" + card.progress,
                    thursday: thisCardDate + "/" + card.progress,
                    friday: thisCardDate + "/" + card.progress,
                    saturday: thisCardDate + "/" + card.progress,
                    sunday: thisCardDate + "/" + card.progress,
                    dueDate: (
                        <TaskDueDate value={(thisCardDate !== '' && thisCardDate !== 0) ? cardDate.getDate() + '-' + (cardDate.toLocaleString('default', { month: 'short' })) + '-' + cardDate.getFullYear() : ''} props={props} project={props.project} cardDueDate={cardDate} cardId={card._id} listId={list._id} />
                    )
                })

            })


        })

        numberOfRows++
        data.push({
            task: (
                <AddList props={props} project={props.project} />
            ),
            progress: '',
            assigned: '',
            monday: "",
            tuesday: "",
            wednesday: "",
            thursday: "",
            friday: "",
            saturday: "",
            sunday: "",
            dueDate: ''
        })

        setTableSize(numberOfRows)


        setTableData(data)
        return numberOfRows


    }, [props.project.lists, props.project, IsVisibleEdit])


    useEffect(() => {
        cardData()
    }, [cardData])



    const DragTrComponent = (props) => {

        const { children = null, rowInfo } = props;
        if (rowInfo) {
            // debugger;
            const { original, index } = rowInfo;
            const { firstName } = original;
            return (
                <Draggable key={firstName} index={index} draggableId={firstName}>
                    {(draggableProvided, draggableSnapshot) => (
                        <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                        >
                            <ReactTable.defaultProps.TrComponent>
                                {children}
                            </ReactTable.defaultProps.TrComponent>
                        </div>
                    )}
                </Draggable>
            )
        } else
            return (
                <ReactTable.defaultProps.TrComponent>
                    {children}
                </ReactTable.defaultProps.TrComponent>
            )

    }

    const DropTbodyComponent = (props) => {

        const { children = null } = props

        return (
            <Droppable droppableId="droppable">
                {(droppableProvided, droppableSnapshot) => (
                    <div ref={droppableProvided.innerRef}>
                        <ReactTable.defaultProps.TbodyComponent>
                            {children}
                        </ReactTable.defaultProps.TbodyComponent>
                    </div>
                )}
            </Droppable>
        )

    }


    const handleDragEnd = result => {
        if (!result.destination) {
            return
        }

        const newData = reorder(
            tableData,
            result.source.index,
            result.destination.index
        );

        // tableData = newData

    };


    const getTrProps = (props, rowInfo) => {

        return { rowInfo }
    };

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    }

    const getHeaderDate = (num) => {
        var nextDay = new Date(startDay);
        nextDay.setDate(nextDay.getDate() + num)
        let dayOfWeek = weekDay(nextDay)
        let day = shownDay(nextDay)
        let color = 'rgb(39, 190, 201)'
        if (dayOfWeek === 'Sunday' || dayOfWeek === 'Saturday') {
            color = 'rgb(206, 134, 134)'
        }
        return (
            <div style={{ background: color, color: 'white' }}>
                <div>{dayOfWeek}</div>
                <div>{day}</div>
            </div>
        )
    }

    const cellData = (value, num) => {

        if (num === 0) {
            if (value) {
                let token = value.split('/')
                let date = Number(token[0])
                let progress = Number(token[1])
                let checked = startDay.setDate(startDay.getDate());

                let color = ''
                let message = ''
                if (date) {
                    switch (true) {
                        case (date === checked):
                            color = 'red';
                            message = 'Due Date'
                            break;
                        case ((progress === 100) || (date === 100)):
                            color = 'green';
                            message = 'Finished'
                            break;
                        case (date > checked):
                            color = 'blue';
                            message = 'In Progress'
                            break;
                        case (date < checked && progress < 100):
                            color = 'red';
                            message = 'Delayed'
                            break;
                    }
                    return <div style={{ background: color }} >{message}</div>
                } else {
                    return ''
                }
            } else {
                return value
            }
        } else if (num !== 0) {
            if (value) {
                let token = value.split('/')
                let date = Number(token[0])
                let progress = Number(token[1])
                var checkedDate = new Date(startDay);
                let checked = checkedDate.setDate(checkedDate.getDate() + num);



                let color = ''
                let message = ''
                switch (true) {
                    case (date === checked):
                        color = 'red';
                        message = 'Due Date'
                        break;
                    case (date > checked && progress !== 100):
                        color = 'blue';
                        message = 'In Progress'
                        break;
                }
                return <div style={{ background: color, color: color }} >{message}</div>
            } else {
                return value
            }
        } else {
            return value
        }

    }

    const getNextWeek = async () => {
        var nextDay = startDay
        await nextDay.setDate(nextDay.getDate() + 7)
        await cardData()
        setStartDay(nextDay)
    }

    const getNextDay = async () => {
        var nextDay = startDay
        await nextDay.setDate(nextDay.getDate() + 1)
        await cardData()
        setStartDay(nextDay)


    }


    const getLastWeek = async () => {

        var nextDay = startDay
        nextDay.setDate(nextDay.getDate() - 7)
        await cardData()
        setStartDay(nextDay)
        await cardData()

    }

    const getLastDay = async () => {

        var nextDay = startDay
        nextDay.setDate(nextDay.getDate() - 1)
        await cardData()
        setStartDay(nextDay)
        await cardData()

    }




    return (
        <div className={styles.reactTable}>
            <div className={styles.buttoDiv}>
                <Button onClick={getLastWeek} title='Last week' />
                <Button onClick={getLastDay} title='Previous day' />
                <div>Choose week...
                    <span>
                        <DatePicker selected={startDay} onChange={date => setStartDay(date)} label="Go to date" />
                    </span>
                </div>
                <Button onClick={getNextDay} title='Next day' />
                <Button onClick={getNextWeek} title='Next week' />
            </div>
            <div>
                <DragDropContext onDragEnd={handleDragEnd} >
                    <ReactTable
                        TrComponent={DragTrComponent}
                        TbodyComponent={DropTbodyComponent}
                        getTrProps={getTrProps}
                        data={tableData}
                        columns={[
                            {
                                Header: 'Task',
                                accessor: "task",
                                width: 250,
                                style: {
                                    position: 'static'
                                }
                            },
                            {
                                Header: 'Progress',
                                accessor: "progress",
                                width: 100
                            },
                            {
                                Header: 'Assigned to',
                                accessor: "assigned",
                                width: 200
                            },
                            {
                                Header: getHeaderDate(0),
                                accessor: "monday",
                                width: 100,
                                Cell: ({ value }) => {
                                    return cellData(value, 0)
                                }
                            },
                            {
                                Header: getHeaderDate(1),
                                accessor: "tuesday",
                                width: 100,
                                Cell: ({ value }) => {
                                    return cellData(value, 1)
                                }
                            },
                            {
                                Header: getHeaderDate(2),
                                accessor: "wednesday",
                                width: 100,
                                Cell: ({ value }) => {
                                    return cellData(value, 2)
                                }
                            },
                            {
                                Header: getHeaderDate(3),
                                accessor: "thursday",
                                width: 100,
                                Cell: ({ value }) => {
                                    return cellData(value, 3)
                                }
                            },
                            {
                                Header: getHeaderDate(4),
                                accessor: "friday",
                                width: 100,
                                Cell: ({ value }) => {
                                    return cellData(value, 4)
                                }
                            },
                            {
                                Header: getHeaderDate(5),
                                accessor: "saturday",
                                width: 100,
                                Cell: ({ value }) => {
                                    return cellData(value, 5)
                                }
                            },
                            {
                                Header: getHeaderDate(6),
                                accessor: "sunday",
                                width: 100,
                                Cell: ({ value }) => {
                                    return cellData(value, 6)
                                }
                            },
                            {
                                Header: 'Due Date',
                                accessor: "dueDate",
                                width: 200
                            }
                        ]}
                        defaultPageSize={10}
                        pageSize={tableSize}
                        showPagination={false}
                        className={styles.table, "-striped -highlight"}
                        position={'static'}
                    />
                </DragDropContext>
            </div>

        </div>
    )

}

export default TableDndApp


