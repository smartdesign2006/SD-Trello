import React, { useContext, useMemo } from 'react'
import ProjectContext from '../../../contexts/ProjectContext'
import styles from './index.module.css'
import commonStyles from '../index.module.css'
import ButtonClean from '../../ButtonClean'
import FilterWrapper from '../../FilterWrapper'
import { useDetectOutsideClick } from '../../../utils/useDetectOutsideClick'

const MembersFilter = ({ membersFilter, setMembersFilter, handleFilterClear }) => {
    const [isActive, setIsActive, dropdownRef] = useDetectOutsideClick()
    const { project } = useContext(ProjectContext)

    const options = useMemo(() => {
        return project.membersRoles.map(mr => ({
            value: mr.memberId._id,
            displayValue: mr.memberId.username
        }))
    }, [project.membersRoles])

    const buttonStyles = useMemo(() => `${commonStyles.filter} ${commonStyles['nav-buttons']}`, [])

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
                        className={
                            `${buttonStyles} ${isActive && styles['btn-clicked']} ${membersFilter
                                ? styles['btn-partial']
                                : styles['btn-whole']}`
                        }
                        onClick={() => setIsActive(!isActive)}
                        title={(membersFilter && membersFilter.name) || 'Tasks Assigned To:'}
                    />
                    {membersFilter &&
                        <ButtonClean
                            className={`${buttonStyles} ${commonStyles['filter-clear']}`}
                            title='X'
                            onClick={handleClear}
                        />
                    }
                </div>
                {isActive &&
                    <div className={styles.options} ref={dropdownRef}>
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