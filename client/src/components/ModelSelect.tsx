import { MenuItem } from '@mui/material'
import Select, { SelectChangeEvent } from '@mui/material/Select'

interface Model {
  label: string
  value: string
}

export const models = [
  {
    label: 'Claude 3 Opus',
    value: 'claude-3-opus-20240229',
  },
  {
    label: 'Claude 3 Sonnet',
    value: 'claude-3-sonnet-20240229',
  },
  {
    label: 'Claude 3 Haiku',
    value: 'claude-3-haiku-20240307',
  },
] as Model[]

function ModelSelect({
  model,
  setModel,
}: {
  model: string
  setModel: (model: string) => void
}) {
  const handleChange = (event: SelectChangeEvent) => {
    setModel(event.target.value as string)
  }

  return (
    <div>
      <Select
        defaultValue={models[0].value}
        fullWidth
        onChange={handleChange}
        value={model}
      >
        {models.map((model) => (
          <MenuItem key={model.value} value={model.value}>
            {model.label}
          </MenuItem>
        ))}
      </Select>
    </div>
  )
}

export default ModelSelect
