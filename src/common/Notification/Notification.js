/*
Copyright 2019 Iguazio Systems Ltd.

Licensed under the Apache License, Version 2.0 (the "License") with
an addition restriction as set forth herein. You may not use this
file except in compliance with the License. You may obtain a copy of
the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing
permissions and limitations under the License.

In addition, you may not use the software for any purposes that are
illegal under applicable law, and the grant of the foregoing license
under the Apache 2.0 license is conditioned upon your compliance with
such restriction.
*/
import React from 'react'
import { TransitionGroup, Transition } from 'react-transition-group'
import { useDispatch, useSelector } from 'react-redux'
import { inRange } from 'lodash'

import NotificationView from './NotificationView'

import { removeNotification } from '../../reducers/notificationReducer'

const Notification = () => {
  const dispatch = useDispatch()
  const notificationStore = useSelector(store => store.notificationStore)

  const defaultStyle = {
    position: 'fixed',
    right: '24px',
    bottom: '-100px',
    opacity: 0,
    zIndex: '1000'
  }
  const heightNotification = 60
  const offsetNotification = 60
  const duration = 500

  const handleRetry = item => {
    dispatch(removeNotification(item.id))
    item.retry(item)
  }

  return (
    <TransitionGroup>
      {notificationStore.notification.map((item, index) => {
        const isSuccessResponse = inRange(item.status, 200, 300)
        const bottomPosition =
          (notificationStore.notification.length - index) * heightNotification + offsetNotification

        const transitionStyles = {
          entered: {
            transform: `translateY(-${bottomPosition}px)`,
            opacity: 1,
            transition: `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`
          },
          exiting: {
            transform: 'translateY(0px)',
            opacity: 0,
            transition: `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`
          }
        }

        return (
          <Transition
            key={`css${item.id}`}
            timeout={duration}
            classNames="notification_download"
            onEntered={() => {
              setTimeout(() => {
                dispatch(removeNotification(item.id))
              }, 4000)
            }}
          >
            {state => (
              <NotificationView
                item={item}
                transitionStyles={{
                  ...defaultStyle,
                  ...transitionStyles[state]
                }}
                key={item.id}
                isSuccessResponse={isSuccessResponse}
                retry={handleRetry}
              />
            )}
          </Transition>
        )
      })}
    </TransitionGroup>
  )
}

export default Notification
