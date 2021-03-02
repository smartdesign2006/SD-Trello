import React, { useContext, useMemo, useRef } from 'react'
import ProjectContext from '../../contexts/ProjectContext'
import { useDetectOutsideClick } from '../../utils/useDetectOutsideClick'
import ButtonClean from '../button-clean'
import FilterWrapper from '../filter-wrapper'
import styles from './index.module.css'

const MembersFilter = ({ membersFilter, setMembersFilter, handleFilterClear, buttonStyle }) => {
    const dropdownRef = useRef(null)
    const [isActive, setIsActive] = useDetectOutsideClick(dropdownRef)
    const { project } = useContext(ProjectContext)

    const options = useMemo(() => {
        return project.membersRoles.map(mr => ({
            value: mr.memberId._id,
            displayValue: mr.memberId.username
        }))
    }, [project.membersRoles])

    const handleOptionClick = (optionValue, optionDisplay) => {
        setMembersFilter(optionValue, optionDisplay)

        setIsActive(false)
    }

    const handleClear = () => {
        handleFilterClear()
        setIsActive(false)
    }


    return (
        <FilterWrapper
            legendContent='Tasks assigned to:'
            isVisible={!!(membersFilter)}
        >
            <div className={styles.container}>
                <div className={styles['btn-container']}>
                    <ButtonClean
                        className={isActive
                            ? `${buttonStyle} ${membersFilter && styles['btn-partial']} ${styles['btn-clicked']}`
                            : `${buttonStyle} ${membersFilter && styles['btn-partial']}`}
                        onClick={() => setIsActive(!isActive)}
                        title={(membersFilter && membersFilter.name) || 'Tasks Assigned To:'}
                    />
                    { membersFilter &&
                        <ButtonClean
                            className={`${buttonStyle} ${styles['btn-clear']}`}
                            title='X'
                            onClick={handleClear}
                        />
                    }
                </div>
                {isActive &&
                    <div className={styles.options} ref={dropdownRef}>
                        {/* <div
                            key='clear options'
                            className={`${styles.option} ${styles['option-blank']}`}
                            onClick={handleOptionClear}
                        >
                            Leave blank
                        </div> */}
                        {options.map(option => {
                            return (
                                <div
                                    key={option.value}
                                    className={styles.option}
                                    onClick={() => handleOptionClick(option.value, option.displayValue)}
                                >
                                    {option.displayValue}
                                </div>
                            )
                        })}
                    </div>
                }
            </div>
        </FilterWrapper>
    )
}

export default MembersFilter