import React,{ useRef } from 'react'
import { useDetectOutsideClick } from '../../utils/useDetectOutsideClick'
import ButtonClean from '../button-clean'
import styles from './index.module.css'

const ButtonCleanDropdown = ({ options, title, onOptionClick, onOptionClear }) => {
    const dropdownRef = useRef(null)
    const [isActive, setIsActive] = useDetectOutsideClick(dropdownRef)

    const handleOptionClick = (optionValue, optionDisplay) => {
        onOptionClick(optionValue, optionDisplay)
        setIsActive(false)
    }

    const handleOptionClear = () => {
        onOptionClear()
        setIsActive(false)
    }

    return (
        <div className={styles.container}>
            <ButtonClean
                className={styles.filter}
                onClick={() => setIsActive(!isActive)}
                title={title}
            />
            {
                isActive &&
                <div className={styles.options} ref={dropdownRef}>
                    <div 
                        key='clear options' 
                        className={`${styles.option} ${styles['option-blank']}`}
                        onClick={handleOptionClear}
                    >
                        Leave blank
                    </div>
                    { options.map(option => {
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
    )
}

export default ButtonCleanDropdown