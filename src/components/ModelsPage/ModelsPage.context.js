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
import React, { useContext, useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { useYaml } from '../../hooks/yaml.hook'
import artifactsAction from '../../actions/artifacts'

export const ModelsPageContext = React.createContext({})

export const ModelsPageProvider = ({ children }) => {
  const [models, setModels] = useState([])
  const [convertedYaml, toggleConvertedYaml] = useYaml('')
  const dispatch = useDispatch()
  const params = useParams()

  const fetchData = useCallback(
    async filters => {
      return dispatch(artifactsAction.fetchModels(params.projectName, filters)).then(result => {
        if (result) {
          setModels(result)
        }

        return result
      })
    },
    [dispatch, setModels, params.projectName]
  )

  return (
    <ModelsPageContext.Provider
      value={{
        fetchData,
        convertedYaml,
        models,
        setModels,
        toggleConvertedYaml
      }}
    >
      {children}
    </ModelsPageContext.Provider>
  )
}

export const useModelsPage = () => useContext(ModelsPageContext)