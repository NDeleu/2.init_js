$(function() {
    function displayArticle(content) {
        const newArticle = $("<article>").addClass("mt-4 p-3 border rounded").html(content);
        const existingArticle = $("main article");
        if (existingArticle.length) {
            existingArticle.replaceWith(newArticle);
        } else {
            $("#mainContent").append(newArticle);
        }
    }

    // Fonction pour afficher l'heure actuelle
    function displayCurrentTime() {
        const currentTime = moment().format("dddd, MMMM Do YYYY, HH:mm:ss");
        const currentTimeElement = $("<div>")
            .addClass("position-fixed top-0 end-0 m-3")
            .text(currentTime);
        $("body").append(currentTimeElement);
    }

    // Fonction pour mettre à jour l'heure
    function updateCurrentTime() {
        const currentTime = moment().format("dddd, MMMM Do YYYY, HH:mm:ss");
        $("#currentTime").text(currentTime);
    }

    async function fetchPersonnages() {
        try {
            const response = await axios.get("personnages.json");
            return response.data.personnages;
        } catch (error) {
            console.error("Erreur lors de la récupération des données : ", error);
            return null;
        }
    }

    (async function() {
        const personnages = await fetchPersonnages();
        if (personnages) {
            const options = personnages.map(p => ({ id: p.nom, text: p.nom }));
            $("#existingCharacters").select2({
                data: options,
                placeholder: "Sélectionnez un personnage",
                allowClear: true,
                minimumResultsForSearch: -1 // Désactive la barre de recherche
            });
        }
    })();

    // Préremplir le champ de saisie avec le personnage sélectionné
    $("#existingCharacters").on("select2:select", function(event) {
        const selectedPersonnage = event.params.data.text;
        $("#nameInput").val(selectedPersonnage);
    });

    // Gestion de la soumission du formulaire de recherche
    $("#enterName").on("submit", async function(event) {
        event.preventDefault();
        const nomRecherche = $("#nameInput").val();
        const personnages = await fetchPersonnages();

        if (personnages) {
            const personnageTrouve = personnages.find(
                (p) => _.toLower(_.deburr(p.nom)) === _.toLower(_.deburr(nomRecherche))
            );

            if (personnageTrouve) {
                $(".personnage-image.miniature").each(function() {
                    const src = $(this).attr("src");
                    $(this).parent().attr("href", src);
                });

                const personnageInfo = `
                    <div class="row animate__animated animate__fadeIn">
                        <div class="col-md-6">
                            <h2 class="h4">Nom: ${personnageTrouve.nom}</h2>
                            <p class="mb-1">Classe: ${personnageTrouve.classe}</p>
                            <p>Niveau: ${personnageTrouve.niveau}</p>
                        </div>
                        <div class="col-md-6 text-end">
                            <a href="${personnageTrouve.image}" data-fancybox="images" data-caption="${personnageTrouve.nom}">
                                <img src="${personnageTrouve.image}" alt="${personnageTrouve.nom}" class="personnage-image miniature">
                            </a>
                        </div>
                    </div>
                `;
                displayArticle(personnageInfo);

                // Configuration de FancyBox pour afficher l'image en grand format
                $().fancybox({
                    selector: '[data-fancybox="images"]',
                    openEffect: "fade",
                    closeEffect: "fade",
                    type: "image"
                });

                updateCurrentTime();

            } else {
                displayArticle('<p class="text-danger animate__animated animate__shakeX">Personnage Inconnu</p>');
            }
        }
    });

    // Gestion du clic sur le bouton "Tous les personnages"
    $("#showAll").on("click", async function() {
        const personnages = await fetchPersonnages();

        if (personnages) {
            const sortedPersonnages = _.orderBy(personnages, ['niveau'], ['asc']);
            const charactersList = sortedPersonnages.map(p => `
                <tr>
                    <td>${p.nom}</td>
                    <td>${p.classe}</td>
                    <td>${p.niveau}</td>
                    <td>
                        <a href="${p.image}" data-fancybox="images" data-caption="${p.nom}">
                            <img src="${p.image}" alt="${p.nom}" class="personnage-image miniature">
                        </a>
                    </td>
                </tr>
            `).join('');

            $(".personnage-image.miniature").each(function() {
                const src = $(this).attr("src");
                $(this).parent().attr("href", src);
            });

            displayArticle(`
                <h2 class="h4 animate__animated animate__fadeIn">Liste de tous les personnages :</h2>
                <div class="animate__animated animate__fadeIn" id="dataTableContainer">
                    <table id="dataTable" class="display">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Classe</th>
                                <th>Niveau</th>
                                <th>Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${charactersList}
                        </tbody>
                    </table>
                </div>
            `);

            // Configuration de DataTables
            $("#dataTable").DataTable();

            // Configuration de FancyBox pour afficher l'image en grand format
            $().fancybox({
                selector: '[data-fancybox="images"]',
                openEffect: "fade",
                closeEffect: "fade",
                type: "image"
            });

            updateCurrentTime();
        }
    });

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            console.error("Une erreur s'est produite lors de la requête : ", error);
            return Promise.reject(error);
        }
    );

    // Créez un carrousel Slick pour les messages
    $("#slickContainer").slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        dots: false,
        infinite: true,
        fade: true,
        cssEase: "linear",
        adaptiveHeight: true,
        speed: 500,
        pauseOnHover: false,
        customPaging: function() {
            return "";
        }
    });

    // Ajoutez les messages au carrousel
    const messages = [
        "Ce projet a pour but de comprendre divers stacks",
        "Merci de l'intérêt que vous portez à ces tests",
        "Réalisé par Nicolas Deleu"
    ];

    messages.forEach(function(message) {
        $("#slickContainer").slick("slickAdd", `<div class="slick-message ms-2">${message}</div>`);
    });

    // Mettez à jour l'heure lorsque le carrousel tourne
    $("#slickContainer").on("beforeChange", function() {
        updateCurrentTime();
    });

    // Affichez l'heure actuelle au chargement de la page
    updateCurrentTime();
});
