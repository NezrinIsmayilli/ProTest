import React from 'react';
import { Badge, Avatar } from 'antd';
import moment from 'moment';
import styles from '../../styles.module.scss';

const icons = {
    telegram:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOnVybCgjU1ZHSURfMV8pO30KCS5zdDF7ZmlsbDojRkZGRkZGO30KCS5zdDJ7ZmlsbDojRDJFNEYwO30KCS5zdDN7ZmlsbDojQjVDRkU0O30KPC9zdHlsZT48Zz48bGluZWFyR3JhZGllbnQgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJTVkdJRF8xXyIgeDE9IjI1NiIgeDI9IjI1NiIgeTE9IjAiIHkyPSI1MTAuMTMyMiI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojNDFCQ0U3Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMjJBNkRDIi8+PC9saW5lYXJHcmFkaWVudD48Y2lyY2xlIGNsYXNzPSJzdDAiIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI1NiIvPjxnPjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0zODAuNiwxNDcuM2wtNDUuNywyMzAuNWMwLDAtNi40LDE2LTI0LDguM2wtMTA1LjUtODAuOUwxNjcsMjg2LjdsLTY0LjYtMjEuN2MwLDAtOS45LTMuNS0xMC45LTExLjIgICAgYy0xLTcuNywxMS4yLTExLjgsMTEuMi0xMS44bDI1Ni44LTEwMC43QzM1OS41LDE0MS4yLDM4MC42LDEzMS45LDM4MC42LDE0Ny4zeiIvPjxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xOTcuMiwzNzUuMmMwLDAtMy4xLTAuMy02LjktMTIuNGMtMy44LTEyLjEtMjMuMy03Ni4xLTIzLjMtNzYuMWwxNTUuMS05OC41YzAsMCw5LTUuNCw4LjYsMCAgICBjMCwwLDEuNiwxLTMuMiw1LjRjLTQuOCw0LjUtMTIxLjgsMTA5LjctMTIxLjgsMTA5LjciLz48cGF0aCBjbGFzcz0ic3QzIiBkPSJNMjQ1LjgsMzM2LjJsLTQxLjcsMzguMWMwLDAtMy4zLDIuNS02LjgsMC45bDgtNzAuNyIvPjwvZz48L2c+PC9zdmc+',
    whatsapp:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAByRJREFUaEPVWW1wlNUVfs59E/LRpIVMa5AohGQ3kOxuaKHtVG0Bf7XTqXUE0jIoFRz2TbH40apAta2xI2CcsY7aIrsbRBFLZiLCKNUitWhLx9ahg9llEXY3fAgmNCQhSjLEze49nfcNCbvZ7O67X3R6/u3cc57zPO/9OOfeJfyfG2WLf6X37ql5CH+bwlxLhBoGlwH0hRF8HiRJvayQjwnHQlAOnrJsPpeN3BkJMHnUagEsZ+YGENWlRIjhZUIbsfKyv/75EynFRjinJcDUvupbROKXAG4BIS2MMQ4MJsGvg5SNPsuWD1IVklLy2qPqteFhNLPA8lQTGfKXtFcK5e4O2+YzhvwB41/P5FYbiOAC8CWj4Gn69YN4ld/q2mUkPvkMcJMwezqfAuF+I4DZ8mHi3wUsFQ+BmmQizIQC6rwNk0Ky7GUG/yhbxFLEac0XF+48amkLxouLL4CbRM2Rrp3/Q/KjnFv91mm3x5uJuALMbvXpq71s4n1lfTlZXQ9MND6hAJO3cQlJbktxunPsTov9Nsdr45PECJh17K5pcjjv6FU4bVISTOALQZFfN76CxwgwtautJPDjZOizC6/DzIJyBGUIBweO4nMeThaS8TgBO3w2Z1QNihKgV1gh3k+WqWnaMiwrWzDmduCiG42n/5AsLPNxBguibx63OQ6NgkUJMHvU1/X2IIEtmXITNlb8JMajoeMJtF86mTnJpAi0229zLIoRoDVmxPAn6m0UEninZgOm5ZfFpHnz00O4/4xWqHNs2iywrD4+p0X/WmMzUONRmxh4NFH6+SUWtFTeO6FLkEP4zrF1uBAeyLECjTX92m91PB4lwOy2e5O1xOpXvosHy8dmL4boY5078UrfuzkXwIAnYHPWjwmY6VlVnseiK1lrvOaaH+Dea+Jvkd3972Pd2RdzLgAMDpG89qSt5T/6EjJauG6bfAOar1sRl+CO3gP4bVdr7gXoGUYK24gAt/03RPRYssxT86fg3VmbIOJ04ctPPoV/DfqSwWRr/Fd+m3ODLqCmXd1u9JLimnEPFpRaY0i80LMfT5x7NVvkkuIweHvA5rpTF2D22P8E0PeTRgE6eU1EpA3KIdx8/GH0hweNQGTHR9Je/xzHLSNLyLPqPYKYbxS5tWot5hZXR7nv6f8n1p7dZhQiG37v+W3OhaNL6K8scLNR1HnFJvyx6sGYQ2v16c1452K7UZhM/a4IMLvtbSBakgri+H5Iix2QQ1h6ohm+oc5UoNLzjVxC5iOqAww1FaRiUYDd1Y/oHWmk9YQ+w8pTz+D40NlU4FL3Zbzkr3euuLwH1EcJaEoVRSPfVrUeX1SKo0I/DQ/i52da9DZ7ImuYchN+UX4bWvv+hh19B9Abuphqas3/yjFa7W38npD8VjooXyuuwtbK+1AiCqPCwyzR0vM2ft+9N+quoJ1iW6b/DFpjqNmQHIZWwbf17MepYLdhCgRe5LO5duszUHl4xeR8Jb8XdBnVMMyI45yimXih8j6UKkUxkZ8Ee/H8+bd0krMKK/DKzAdQJApi/CQY+z87jE1dbegc7kvMgMEcGi4PzN12fqwbNXtU7fjQG6R0rLbwejhnrEF5/uQJw7tD/SgVRROSjwx4rvsNPNe9NyEFZm4P1Lu+qjmNCTC51fVE2JQO+dEYjbxjxhrUFV6fNsyT53bpSy+REfCIz+bcGCVAe/ccDvPHBMpLOzuAIjEJa6cu1q+c6bz73hp4HB8NJXgaZZahPFl1sm7r6SgB2o+aI/Y9zHRrJgJGY7VKvW7qEmib3KgZrOa7/DbnWM2KuhPPdqu2MOEwAMVo0sRTTbihZDbuKFuI+aVWTIozudoG3nXhH9AuRNrNLq5pm1cR8wKWLRpH3WKfVdyNTiK2Z0NAJIZ2zN5YUgtb0QzUFk1HmVKCIRmE59JpaF8+4bK5DCSJXuywOlZG4sYK8DbWkWRvtgVkiseMPmZR2zFnS1SxiBXgsS8n0PZME2Y1XvsXB1jkq3fuGY8bI8DsUXcCWJpVApmCETf7ra71E8FECVh4oCnvky93ngcwcTXKlEga8ZJ5Z4et4g5Dz+smt30BEeX+XcSgEO0ttPRz3PXvrzvjPrxGzUC1R31SAA8ZxM+dm/7PJZp9FufDIHDiozpi1MjjVu5YjyAzy14IZWXA6njDSK4rzZx7dRUo3JEgKMyMQyB0EfMP0+1cExUpKeglCgbXal2mEfJRhczsabwH4GfHBWrXqrcZvK9AyL94LVv1PtfkbawTzE0seXHGQpi1fyFfg4INfovrQ6PER/0i2unGPwNyPpj+TqB9UpH7AhZXwoJW8+FPK6DIpQwsAzDXcHKdNLUT4dWQwI4TFufHhmPHOUa00/YFQwMlH5y98elL6YBNd6+eMonC3xDgeUxUCcllDKG/wxN4QArqU1j6wPQRCnDQN8vZk06epIUsG6BXE+O/qcuST6nGGksAAAAASUVORK5CYII=',
    facebook:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iMTAwJSIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjEwMCUiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2VyaWY9Imh0dHA6Ly93d3cuc2VyaWYuY29tLyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGlkPSJNZXNzZW5nZXJfNF8iPjxwYXRoIGQ9Ik0yNTYsMC4wMDNjLTE0NC4yMjUsMCAtMjU2LDEwNS42NDUgLTI1NiwyNDguMzI2YzAsNzQuNjM2IDMwLjU5NiwxMzkuMTI2IDgwLjQwNiwxODMuNjgxYzQuMTcyLDMuNzYgNi42OTYsOC45NjMgNi45MDIsMTQuNTc3bDEuMzkxLDQ1LjUzNGMwLjQ2MywxNC41MjYgMTUuNDUyLDIzLjk1MiAyOC43NDIsMTguMTMxbDUwLjc4OCwtMjIuNDA2YzQuMzI2LC0xLjkwNiA5LjExNywtMi4yNjYgMTMuNjUsLTEuMDNjMjMuMzMzLDYuNDM4IDQ4LjIxMiw5LjgzOCA3NC4xMjEsOS44MzhjMTQ0LjIyNiwwIDI1NiwtMTA1LjY0NSAyNTYsLTI0OC4zMjVjMCwtMTQyLjY4MSAtMTExLjc3NCwtMjQ4LjMyNiAtMjU2LC0yNDguMzI2WiIgaWQ9IkJ1YmJsZV9Tb2xpZF8zXyIgc3R5bGU9ImZpbGw6dXJsKCNfTGluZWFyMSk7Ii8+PHBhdGggZD0iTTEwMi4yOTcsMzIwLjk1Nmw3NS4yMDMsLTExOS4yOTVjMTEuOTUsLTE4Ljk1NSAzNy42MDIsLTIzLjY5NCA1NS41MjcsLTEwLjI1bDU5LjgwMiw0NC44NjRjNS41MTIsNC4xMjEgMTMuMDMyLDQuMDcgMTguNDkyLC0wLjA1MWw4MC43NjYsLTYxLjI5NmMxMC43NjYsLTguMTkgMjQuODc5LDQuNzM5IDE3LjYxNiwxNi4xNzRsLTc1LjE1MSwxMTkuMjQ0Yy0xMS45NTEsMTguOTU1IC0zNy42MDIsMjMuNjk0IC01NS41MjcsMTAuMjVsLTU5LjgwMiwtNDQuODY1Yy01LjUxMiwtNC4xMiAtMTMuMDMyLC00LjA2OSAtMTguNDkyLDAuMDUybC04MC44MTgsNjEuMzQ3Yy0xMC43NjUsOC4xOSAtMjQuODc5LC00LjczOSAtMTcuNjE2LC0xNi4xNzRaIiBpZD0iQm9sdF80XyIgc3R5bGU9ImZpbGw6I2ZmZjsiLz48L2c+PGRlZnM+PGxpbmVhckdyYWRpZW50IGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMS40NTAzOGUtMTMsNTEyLC01MTIsMS40NTAzOGUtMTMsMjU2LDAuMDAzMjQ2NSkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iX0xpbmVhcjEiIHgxPSIwIiB4Mj0iMSIgeTE9IjAiIHkyPSIwIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMGIyZmY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDZhZmY7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=',
    instagram:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEyOCAxMjgiIGlkPSJTb2NpYWxfSWNvbnMiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGlkPSJfeDM3X19zdHJva2UiPjxnIGlkPSJJbnN0YWdyYW1fMV8iPjxyZWN0IGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBoZWlnaHQ9IjEyOCIgd2lkdGg9IjEyOCIvPjxyYWRpYWxHcmFkaWVudCBjeD0iMTkuMTExMSIgY3k9IjEyOC40NDQ0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgaWQ9Ikluc3RhZ3JhbV8yXyIgcj0iMTYzLjU1MTkiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0ZGQjE0MCIvPjxzdG9wIG9mZnNldD0iMC4yNTU5IiBzdHlsZT0ic3RvcC1jb2xvcjojRkY1NDQ1Ii8+PHN0b3Agb2Zmc2V0PSIwLjU5OSIgc3R5bGU9InN0b3AtY29sb3I6I0ZDMkI4MiIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzhFNDBCNyIvPjwvcmFkaWFsR3JhZGllbnQ+PHBhdGggY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTA1Ljg0MywyOS44MzcgICAgYzAsNC4yNDItMy40MzksNy42OC03LjY4LDcuNjhjLTQuMjQxLDAtNy42OC0zLjQzOC03LjY4LTcuNjhjMC00LjI0MiwzLjQzOS03LjY4LDcuNjgtNy42OCAgICBDMTAyLjQwNSwyMi4xNTcsMTA1Ljg0MywyNS41OTUsMTA1Ljg0MywyOS44Mzd6IE02NCw4NS4zMzNjLTExLjc4MiwwLTIxLjMzMy05LjU1MS0yMS4zMzMtMjEuMzMzICAgIGMwLTExLjc4Miw5LjU1MS0yMS4zMzMsMjEuMzMzLTIxLjMzM2MxMS43ODIsMCwyMS4zMzMsOS41NTEsMjEuMzMzLDIxLjMzM0M4NS4zMzMsNzUuNzgyLDc1Ljc4Miw4NS4zMzMsNjQsODUuMzMzeiBNNjQsMzEuMTM1ICAgIGMtMTguMTUxLDAtMzIuODY1LDE0LjcxNC0zMi44NjUsMzIuODY1YzAsMTguMTUxLDE0LjcxNCwzMi44NjUsMzIuODY1LDMyLjg2NWMxOC4xNTEsMCwzMi44NjUtMTQuNzE0LDMyLjg2NS0zMi44NjUgICAgQzk2Ljg2NSw0NS44NDksODIuMTUxLDMxLjEzNSw2NCwzMS4xMzV6IE02NCwxMS41MzJjMTcuMDg5LDAsMTkuMTEzLDAuMDY1LDI1Ljg2MSwwLjM3M2M2LjI0LDAuMjg1LDkuNjI5LDEuMzI3LDExLjg4NCwyLjIwNCAgICBjMi45ODcsMS4xNjEsNS4xMTksMi41NDgsNy4zNTksNC43ODhjMi4yNCwyLjIzOSwzLjYyNyw0LjM3MSw0Ljc4OCw3LjM1OWMwLjg3NiwyLjI1NSwxLjkxOSw1LjY0NCwyLjIwNCwxMS44ODQgICAgYzAuMzA4LDYuNzQ5LDAuMzczLDguNzczLDAuMzczLDI1Ljg2MmMwLDE3LjA4OS0wLjA2NSwxOS4xMTMtMC4zNzMsMjUuODYxYy0wLjI4NSw2LjI0LTEuMzI3LDkuNjI5LTIuMjA0LDExLjg4NCAgICBjLTEuMTYxLDIuOTg3LTIuNTQ4LDUuMTE5LTQuNzg4LDcuMzU5Yy0yLjIzOSwyLjI0LTQuMzcxLDMuNjI3LTcuMzU5LDQuNzg4Yy0yLjI1NSwwLjg3Ni01LjY0NCwxLjkxOS0xMS44ODQsMi4yMDQgICAgYy02Ljc0OCwwLjMwOC04Ljc3MiwwLjM3My0yNS44NjEsMC4zNzNjLTE3LjA5LDAtMTkuMTE0LTAuMDY1LTI1Ljg2Mi0wLjM3M2MtNi4yNC0wLjI4NS05LjYyOS0xLjMyNy0xMS44ODQtMi4yMDQgICAgYy0yLjk4Ny0xLjE2MS01LjExOS0yLjU0OC03LjM1OS00Ljc4OGMtMi4yMzktMi4yMzktMy42MjctNC4zNzEtNC43ODgtNy4zNTljLTAuODc2LTIuMjU1LTEuOTE5LTUuNjQ0LTIuMjA0LTExLjg4NCAgICBjLTAuMzA4LTYuNzQ5LTAuMzczLTguNzczLTAuMzczLTI1Ljg2MWMwLTE3LjA4OSwwLjA2NS0xOS4xMTMsMC4zNzMtMjUuODYyYzAuMjg1LTYuMjQsMS4zMjctOS42MjksMi4yMDQtMTEuODg0ICAgIGMxLjE2MS0yLjk4NywyLjU0OC01LjExOSw0Ljc4OC03LjM1OWMyLjIzOS0yLjI0LDQuMzcxLTMuNjI3LDcuMzU5LTQuNzg4YzIuMjU1LTAuODc2LDUuNjQ0LTEuOTE5LDExLjg4NC0yLjIwNCAgICBDNDQuODg3LDExLjU5Nyw0Ni45MTEsMTEuNTMyLDY0LDExLjUzMnogTTY0LDBDNDYuNjE5LDAsNDQuNDM5LDAuMDc0LDM3LjYxMywwLjM4NUMzMC44MDEsMC42OTYsMjYuMTQ4LDEuNzc4LDIyLjA3OCwzLjM2ICAgIGMtNC4yMDksMS42MzUtNy43NzgsMy44MjQtMTEuMzM2LDcuMzgyQzcuMTg0LDE0LjMsNC45OTUsMTcuODY5LDMuMzYsMjIuMDc4Yy0xLjU4Miw0LjA3MS0yLjY2NCw4LjcyMy0yLjk3NSwxNS41MzUgICAgQzAuMDc0LDQ0LjQzOSwwLDQ2LjYxOSwwLDY0YzAsMTcuMzgxLDAuMDc0LDE5LjU2MSwwLjM4NSwyNi4zODdjMC4zMTEsNi44MTIsMS4zOTMsMTEuNDY0LDIuOTc1LDE1LjUzNSAgICBjMS42MzUsNC4yMDksMy44MjQsNy43NzgsNy4zODIsMTEuMzM2YzMuNTU4LDMuNTU4LDcuMTI3LDUuNzQ2LDExLjMzNiw3LjM4MmM0LjA3MSwxLjU4Miw4LjcyMywyLjY2NCwxNS41MzUsMi45NzUgICAgQzQ0LjQzOSwxMjcuOTI2LDQ2LjYxOSwxMjgsNjQsMTI4YzE3LjM4MSwwLDE5LjU2MS0wLjA3NCwyNi4zODctMC4zODVjNi44MTItMC4zMTEsMTEuNDY0LTEuMzkzLDE1LjUzNS0yLjk3NSAgICBjNC4yMDktMS42MzYsNy43NzgtMy44MjQsMTEuMzM2LTcuMzgyYzMuNTU4LTMuNTU4LDUuNzQ2LTcuMTI3LDcuMzgyLTExLjMzNmMxLjU4Mi00LjA3MSwyLjY2NC04LjcyMywyLjk3NS0xNS41MzUgICAgQzEyNy45MjYsODMuNTYxLDEyOCw4MS4zODEsMTI4LDY0YzAtMTcuMzgxLTAuMDc0LTE5LjU2MS0wLjM4NS0yNi4zODdjLTAuMzExLTYuODEyLTEuMzkzLTExLjQ2NC0yLjk3NS0xNS41MzUgICAgYy0xLjYzNi00LjIwOS0zLjgyNC03Ljc3OC03LjM4Mi0xMS4zMzZjLTMuNTU4LTMuNTU4LTcuMTI3LTUuNzQ2LTExLjMzNi03LjM4MmMtNC4wNzEtMS41ODItOC43MjMtMi42NjQtMTUuNTM1LTIuOTc1ICAgIEM4My41NjEsMC4wNzQsODEuMzgxLDAsNjQsMHoiIGZpbGw9InVybCgjSW5zdGFncmFtXzJfKSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iSW5zdGFncmFtIi8+PC9nPjwvZz48L3N2Zz4=',
};

const textToShort = text =>
    text && text.length > 20 ? `${text.substring(0, 20)}...` : text;

const handleLastMessage = (type, lastMessage) => {
    if (
        type === 'text' &&
        lastMessage &&
        lastMessage.length > 0 &&
        lastMessage[0].text !== null
    ) {
        return textToShort(lastMessage[0].text);
    }
    if (
        type === 'text' &&
        lastMessage &&
        lastMessage.length > 0 &&
        lastMessage[0].text === null &&
        lastMessage[0].messageAttachments.length > 0
    ) {
        return lastMessage[0].messageAttachments[0].attachment.type === 'image'
            ? 'Şəkil'
            : lastMessage[0].messageAttachments[0].attachment.type === 'audio'
            ? 'Audio'
            : 'Fayl';
    }
    if (type === 'date' && lastMessage && lastMessage.length > 0) {
        return moment(lastMessage[0].createdAt).format('HH:mm');
    }
};

export function ChatCard({ item, selected, toggleSelected }) {
    return (
        <li
            className={item.id === selected ? styles.selected : null}
            onClick={() => toggleSelected(item.id)}
        >
            <div className={styles.avatarWrapper}>
                <Badge dot={item.unread || false}>
                    <Avatar
                        src={item.contact.avatar}
                        size={48}
                        shape="square"
                    />
                </Badge>
            </div>
            <div className={styles.textWrapper}>
                <div>
                    {item.contact.name} {item.contact.surname}
                </div>
                <span>{handleLastMessage('text', item.lastMessage)}</span>
            </div>
            <div className={styles.timeWrapper}>
                <div>{handleLastMessage('date', item.lastMessage)}</div>
                <span>
                    <img src={icons[item.channel.type]} alt="Messenger" />
                </span>
            </div>
        </li>
    );
}
