# DeleteEvent UseCase

## Dados
* Id do Usuário
* Id da Pelada

## Fluxo primário
1. Obter os dados do grupo da pelada a ser removida
2. Verificar se o usuário que solicitou a exclusão da pelada tem permissão (admin ou dono)
3. Remover a pelada com Id acima
4. Remover todas as partidas dessa pelada

## Fluxo alternativo: Não foi encontrado um grupo para o id da Pelada informada
* Retornar erro

## Fluxo alternativo: O usuário não pertence ao grupo
* Retornar erro

## Fluxo alternativo: O usuário não tem permissão
* Retornar erro


# Code smells
* Pegando usando uma propriedade de teste em um codigo de produção