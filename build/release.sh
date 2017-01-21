set -e

if [[ -z $1 ]]; then
  echo "Enter new version: "
  read VERSION
else
  VERSION=$1
fi

read -p "Releasing $VERSION - are you sure? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Releasing $VERSION ..."

  npm run test

  # build
  VERSION=$VERSION npm run build

  # update packages
  npm version $VERSION

  npm run docs

  # commit
  git add -A
  git commit -m "[release] $VERSION :sushi:"
  npm version $VERSION --message "[release] $VERSION :sushi:"

  # publish
  git push
  npm publish
fi
