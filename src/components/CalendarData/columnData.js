import React from 'react'
import styles from './index.module.css'
import { checkDateEquality, compareDates, getDateWithOffset, formatDate } from '../../utils/date'

const CELL_COLORS = {
    CREATED: '#0E8D27',
    DUE_DATE: '#EF2D2D',
    DELAYED: '#EF2D2D',
    FINISHED: '#0E8D27',
    PROGRESS: '#5E9DDC',
    PROGRESS_OLD: '#A2A7B0',
}

const assembleColumnData = (startDate) => {
    const currentDate = new Date()
    let cardData = null

    const getWeekdayCellHtml = (message, color, messageColor = 'black') => {
        const progressStyle = { 
            background: color, 
            color: messageColor
        }

        return (
            <div className={styles['dayly-progress']}>
                <div style={progressStyle} className={styles['week-day-cell']}>
                    {message}
                </div>
            </div>
        )
    }

    const getWeekdayCellData = (dataString, numDaysOffset) => {
        if (!dataString) {
            return ''
        }

        // if cell is first to be displayed for this card, parse the incoming data
        // else, it should already have been parsed so we can use it directly
        if (numDaysOffset === 0) {
            cardData = JSON.parse(dataString)
        }

        const { date, history, progress } = cardData
        const cellDate = getDateWithOffset(startDate, numDaysOffset)
        
        const taskStartDate = history.startDate && new Date(history.startDate)
        if (!taskStartDate || compareDates(cellDate, taskStartDate) < 0) {
            return ''
        }

        const eventInCell = history && history.events[formatDate(cellDate, '%d/%m/%y')]
        
        const dueDate = date ? new Date(date) : null
        const isAfterDueDate = dueDate && compareDates(cellDate, dueDate) > 0
        const isBeforeToday = compareDates(cellDate, currentDate) < 0
        let { finishedDate } = history
        finishedDate = finishedDate && new Date(finishedDate)

        if (eventInCell) {
            const [eventType, eventValue] = eventInCell.event.split(' ')

            if (eventType === 'Created') {
                return getWeekdayCellHtml(eventType, CELL_COLORS.CREATED)
            }

            if (eventType === 'Progress' && eventValue && eventValue === '100%') {
                let cellText = 'Finished'
                let cellColor = CELL_COLORS.FINISHED
                
                const lastEventDate = new Date(history.lastEventDate)
                if (compareDates(lastEventDate, cellDate) > 0) {
                    // Task was put at 100% progress at the time, but was later changed again
                    cellText = 'Progress 100%'
                    cellColor = isBeforeToday ? CELL_COLORS.PROGRESS_OLD : CELL_COLORS.PROGRESS
                }

                return getWeekdayCellHtml(cellText, cellColor)
            }

            if (isBeforeToday) {
                return getWeekdayCellHtml(eventInCell.event, CELL_COLORS.PROGRESS_OLD)
            }

            const cellBackgroundColor = isAfterDueDate ? CELL_COLORS.DELAYED : CELL_COLORS.PROGRESS
            return getWeekdayCellHtml(eventInCell.event, cellBackgroundColor)
        }

        // if we get to here, we know that there are no new events on the day of the cell
        const isMonday = numDaysOffset === 0
        const eventsInWeek = history && history.hasEventsInWeek[formatDate(cellDate, '%w/%y')]
        if (isMonday && progress && progress === 100 && !eventsInWeek) {
            // progress for task is 100% and no new events happen during the week
            return getWeekdayCellHtml('Finished', CELL_COLORS.FINISHED)
        }

        if (dueDate) {
            if (checkDateEquality(cellDate, dueDate)) {
                if (compareDates(currentDate, dueDate) > 0) {
                    // cell date is the task due date and current date is later than that
                    return getWeekdayCellHtml('Delayed', CELL_COLORS.DELAYED)
                }

                return getWeekdayCellHtml('Due Date', CELL_COLORS.DUE_DATE)
            }

            if (compareDates(cellDate, dueDate) > 0) {
                // cell date is after due date
                if (isMonday && compareDates(currentDate, dueDate) > 0) {
                    // cell is first shown column (usually Monday) and today is later than that
                    return getWeekdayCellHtml('Delayed', CELL_COLORS.DELAYED)
                }

                return ''
            }

            if (finishedDate && compareDates(cellDate, finishedDate) > 0) {
                // task has finished in the past and cell date is later than date of finish
                return ''
            }

            // task is neither Finished, nor Delayed, but has a Due Date
            // therefore, it's In Progress
            const cellText = isMonday ? 'In Progress' : ''
            const cellColor = isBeforeToday ? CELL_COLORS.PROGRESS_OLD : CELL_COLORS.PROGRESS
            return getWeekdayCellHtml(cellText, cellColor)
        }

        if (finishedDate && compareDates(cellDate, finishedDate) > 0) {
            // task has finished in the past and cell date is later than date of finish
            return ''
        }

        if (isBeforeToday) {
            const cellColor = CELL_COLORS.PROGRESS_OLD
            return getWeekdayCellHtml('', cellColor)
        }

        if (compareDates(cellDate, currentDate) === 0 && progress !== 100) {
            const cellColor = CELL_COLORS.PROGRESS
            return getWeekdayCellHtml('', cellColor)
        }
        
        return ''
    }
        
    const getHeaderDateHtml = (numDaysOffset) => {
        const headerDate = getDateWithOffset(startDate, numDaysOffset)
        const color = checkDateEquality(currentDate, headerDate) ? '#CFE2EC' : ''

        const displayedDate = formatDate(headerDate, '%d.%m')
        const displayedDayOfWeek = formatDate(headerDate, '%A')

        return (
            <div className={styles['date-container']} style={{ backgroundColor: color }}>
                <div>{displayedDayOfWeek}</div>
                <div>{displayedDate}</div>
            </div>
        )
    }

    const wrapCellData = (cellData) => {
        return (
            <div className={styles['cell-data']}>
                {cellData}
            </div>
        )
    }

    return (
        [
            {
                // eslint-disable-next-line react/display-name
                Header: () => {
                    return <div className={styles.header}>Task</div>
                },
                accessor: 'task',
                minWidth: 350,
                Cell: ({ value }) => wrapCellData(value),
                sortable: true,
                resizable: false,
            },
            {
                // eslint-disable-next-line react/display-name
                Header: () => {
                    return <div className={styles.header}>Progress</div>
                },
                accessor: 'progress',
                minWidth: 65,
                maxWidth: 75,
                Cell: ({ value }) => wrapCellData(value),
                sortable: true,
                resizable: false,
                sortMethod: () => {}  // needed to override default sorting
            },
            {
                // eslint-disable-next-line react/display-name
                Header: () => {
                    return <div className={styles.header}>Team</div>
                },
                accessor: 'assigned',
                minWidth: 75,
                maxWidth: 80,
                Cell: ({ value }) => wrapCellData(value),
                getProps: () => ({ style: { overflow: 'visible' } }),
                sortable: false,
                resizable: false
            },
            {
                Header: getHeaderDateHtml(0),
                accessor: 'monday',
                minWidth: 95,
                maxWidth: 125,
                Cell: ({ value }) => getWeekdayCellData(value, 0),
                sortable: false,
                resizable: false
            },
            {
                Header: getHeaderDateHtml(1),
                accessor: 'tuesday',
                minWidth: 95,
                maxWidth: 125,
                Cell: ({ value }) => getWeekdayCellData(value, 1),
                sortable: false,
                resizable: false
            },
            {
                Header: getHeaderDateHtml(2),
                accessor: 'wednesday',
                minWidth: 95,
                maxWidth: 125,
                Cell: ({ value }) => getWeekdayCellData(value, 2),
                sortable: false,
                resizable: false
            },
            {
                Header: getHeaderDateHtml(3),
                accessor: 'thursday',
                minWidth: 95,
                maxWidth: 125,
                Cell: ({ value }) => getWeekdayCellData(value, 3),
                sortable: false,
                resizable: false
            },
            {
                Header: getHeaderDateHtml(4),
                accessor: 'friday',
                minWidth: 95,
                maxWidth: 125,
                Cell: ({ value }) => getWeekdayCellData(value, 4),
                sortable: false,
                resizable: false
            },
            {
                Header: getHeaderDateHtml(5),
                accessor: 'saturday',
                minWidth: 95,
                maxWidth: 125,
                Cell: ({ value }) => getWeekdayCellData(value, 5),
                sortable: false,
                resizable: false
            },
            {
                Header: getHeaderDateHtml(6),
                accessor: 'sunday',
                minWidth: 95,
                maxWidth: 125,
                Cell: ({ value }) => getWeekdayCellData(value, 6),
                sortable: false,
                resizable: false
            },
            {
                // eslint-disable-next-line react/display-name
                Header: () => {
                    return <div className={styles.header}>Due Date</div>
                },
                accessor: 'dueDate',
                minWidth: 100,
                maxWidth: 130,
                sortable: true,
                resizable: false,
                sortMethod: () => {} // needed to override default sorting
            }
        ]
    )
}


export default assembleColumnData
