import { GithubUser } from './GithubUser.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }
  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }
  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        clearSearch(this.inputSearch)
        throw new Error(`Usuário ${username} já está salvo!`)
      }

      const user = await GithubUser.search(username)
      if (user.login === undefined) {
        clearSearch(this.inputSearch)
        throw new Error(`Usuário ${username} não existe!`)
      }

      this.entries = [user, ...this.entries]
      this.update()
      clearSearch(this.inputSearch)
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    this.inputSearch = this.root.querySelector('#input-search')
    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    if (this.entries.length === 0) {
      this.root.querySelector('.empty').classList.remove('hide')
    } else {
      this.root.querySelector('.empty').classList.add('hide')
    }

    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOK = confirm(
          `Tem certeza que deseja remover este usuário dos seus favoritos?`
        )

        if (isOK) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
    <tr>
      <td class="user">
        <img src=""  alt="Imagem do Usuário">
        <a href="" target="_blank">
          <p>
            
          </p>
          <span>
            
          </span>
        </a>
      </td>
      <td class="repositories">
        
      </td>
      <td class="followers">
       
      </td>
      <td>
        <button class="remove">
          Remover
        </button>
      </td>
    </tr>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}

function clearSearch(element) {
  element.value = null
}
