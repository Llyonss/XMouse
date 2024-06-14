import Storage from '../storage'

const storage = new Storage()

export default class CustomService {
  deleteLego(message) {
    const data = storage.get('LegoList', [])
    const index = data.findIndex(({ group, name }) => group === message.data.group && name === message.data.name)
    if (index === -1)
      return [404, data]
    data.splice(index, 1)
    storage.set('LegoList', data)
    return [0, data]
  }

  deleteMultiLego(message) {
    const data = storage.get('LegoList', [])
    message.data?.forEach((item: any) => {
      const index = data.findIndex(({ group, name }) => group === item.group && name === item.name)
      if (index === -1)
        return
      data.splice(index, 1)
    })
    storage.set('LegoList', data)
    return [0, data]
  }

  addLego(message: any) {
    const data = storage.get('LegoList', [])
    data.push(message.data)
    storage.set('LegoList', data)
    return [0, data]
  }

  getLego() {
    return [0, storage.get('LegoList', [])]
  }

  updateLego(message) {
    const data = storage.get('LegoList', [])
    const index = data.findIndex(({ group, name }) => group === message.data.old.group && name === message.data.old.name)
    if (index === -1)
      return [404, data]

    data[index] = message.data.new
    storage.set('LegoList', data)
    return [0, data]
  }

  importLego(message) {
    const data = storage.get('LegoList', [])
    message.data?.forEach((item: any) => {
      const index = data.findIndex(({ name, group }) => name === item.name && group === item.group)
      const isAdd = index === -1
      if (isAdd) {
        data.push(item)
        return
      }
      const isUpdate = true
      if (isUpdate)
        data[index] = item
    })
    storage.set('LegoList', data)
    return [0, data]
  }
}
